import { GoogleGenerativeAI } from '@google/generative-ai';

interface FileDetails {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

interface FileChange {
  originalPath: string;
  newPath: string;
  reason: string;
  tags?: string[];
  contentSummary?: string;
}

interface FileContent {
  type: 'text' | 'image' | 'binary';
  content: string | Uint8Array;
  mimeType?: string;
}

export class GeminiService {
  private model: any;
  private visionModel: any;
  private chunkSize = 30000;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    this.visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async *analyzeFilesStream(files: FileDetails[]): AsyncGenerator<FileChange> {
    for (const file of files) {
      try {
        const result = await window.electron.readFile(file.path);
        const change = await this.analyzeFileContent(file, result);
        await new Promise(resolve => setTimeout(resolve, 100));
        yield change;
      } catch (error) {
        console.error(`Error analyzing file ${file.path}:`, error);
      }
    }
  }

  private async analyzeFileContent(
    file: FileDetails,
    content: { data: ArrayBuffer; text: string | null }
  ): Promise<FileChange> {
    try {
      let analysis;
      
      // Handle different file types appropriately
      if (content.text || this.isDocumentFile(file.type)) {
        // For text files and documents that can be read as text
        const textContent = content.text || await this.extractTextFromDocument(content.data, file.type);
        if (textContent) {
          analysis = await this.analyzeTextContent(textContent, file.type);
        } else {
          analysis = await this.analyzeBinaryContent(new Uint8Array(content.data), file.type);
        }
      } else {
        // For binary files (images, etc.)
        analysis = await this.analyzeBinaryContent(new Uint8Array(content.data), file.type);
      }

      if (typeof analysis.summary === 'string' && analysis.summary.includes('```json')) {
        const jsonMatch = analysis.summary.match(/```json\s*({[\s\S]*?})\s*```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          analysis = parsed;
        }
      }

      return {
        originalPath: file.path,
        newPath: this.buildNewPath(file, analysis),
        reason: analysis.summary || 'No summary available',
        tags: analysis.tags || [],
        contentSummary: analysis.summary || 'No summary available'
      };
    } catch (error) {
      console.error(`Error analyzing content for ${file.path}:`, error);
      return {
        originalPath: file.path,
        newPath: `uncategorized/${file.name}`,
        reason: 'Could not analyze file content',
        tags: ['unprocessed'],
        contentSummary: 'Analysis failed'
      };
    }
  }

  private isDocumentFile(extension: string): boolean {
    return ['.doc', '.docx', '.pdf', '.rtf', '.odt'].includes(extension.toLowerCase());
  }

  private async extractTextFromDocument(data: ArrayBuffer, fileType: string): Promise<string | null> {
    // Send the document for text extraction via IPC
    try {
      const result = await window.electron.extractText({
        data: Array.from(new Uint8Array(data)),
        type: fileType
      });
      return result.text;
    } catch (error) {
      console.error('Error extracting text from document:', error);
      return null;
    }
  }

  private async analyzeBinaryContent(
    data: Uint8Array,
    fileType: string
  ): Promise<{ summary: string; tags: string[]; category?: string }> {
    const mimeType = this.getMimeType(fileType);
    const base64Data = this.arrayBufferToBase64(data);

    const prompt = `Analyze this file and provide a JSON response in this exact format without any markdown formatting or additional text:
{
  "summary": "detailed description",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "suggested-folder-name"
}`;

    try {
      const result = await this.visionModel.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType
          }
        }
      ]);

      const response = await result.response;
      const text = response.text().trim();
      
      // Remove any markdown formatting if present
      const jsonStr = text.replace(/```json\s*|\s*```/g, '').trim();
      
      try {
        return JSON.parse(jsonStr);
      } catch {
        return {
          summary: text,
          tags: [this.getDefaultCategory(fileType)],
          category: this.getDefaultCategory(fileType)
        };
      }
    } catch (error) {
      console.error('Error in binary content analysis:', error);
      return {
        summary: 'Binary file',
        tags: [this.getDefaultCategory(fileType)],
        category: this.getDefaultCategory(fileType)
      };
    }
  }

  private async analyzeTextContent(
    text: string,
    fileType: string
  ): Promise<{ summary: string; tags: string[]; category?: string }> {
    const chunks = this.chunkText(text);
    const summaries = await Promise.all(
      chunks.map(chunk => this.analyzeTextChunk(chunk))
    );

    const prompt = `
      Based on this content, provide:
      1. A comprehensive summary of the main topics and themes
      2. Relevant category tags for organization
      3. The most appropriate folder name for this content

      Content: ${summaries.join(' ')}

      Return the response as JSON in this format:
      {
        "summary": "detailed summary",
        "tags": ["tag1", "tag2", "tag3"],
        "category": "suggested-folder-name"
      }
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    
    try {
      return JSON.parse(response.text());
    } catch {
      return {
        summary: response.text(),
        tags: [this.getDefaultCategory(fileType)],
        category: this.getDefaultCategory(fileType)
      };
    }
  }

  private async analyzeTextChunk(chunk: string): Promise<string> {
    const prompt = `Analyze this text and provide a brief summary: ${chunk}`;
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.md': 'text/markdown'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  private getDefaultCategory(extension: string): string {
    const categories: Record<string, string> = {
      '.pdf': 'documents',
      '.jpg': 'images',
      '.jpeg': 'images',
      '.png': 'images',
      '.gif': 'images',
      '.webp': 'images',
      '.doc': 'documents',
      '.docx': 'documents',
      '.txt': 'text',
      '.md': 'documentation'
    };
    return categories[extension.toLowerCase()] || 'other';
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += this.chunkSize) {
      chunks.push(text.slice(i, i + this.chunkSize));
    }
    return chunks;
  }

  private buildNewPath(
    file: FileDetails,
    analysis: { summary: string; tags: string[]; category?: string }
  ): string {
    const category = analysis.category || analysis.tags[0] || 'uncategorized';
    const subcategory = analysis.tags[1];
    const parts = file.path.split('/');
    const fileName = parts[parts.length - 1];
    
    return subcategory 
      ? `${category}/${subcategory}/${fileName}`
      : `${category}/${fileName}`;
  }
}
