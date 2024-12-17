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
}

export class GeminiService {
  private model: any;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async *analyzeFilesStream(files: FileDetails[]): AsyncGenerator<FileChange> {
    const prompt = this.buildPrompt(files);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const changes = await this.parseResponse(text, files);
      
      // Simulate streaming for now since Gemini doesn't support true streaming yet
      for (const change of changes) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add small delay
        yield change;
      }
    } catch (error) {
      console.error('Error analyzing files with Gemini:', error);
      throw error;
    }
  }

  async analyzeFiles(files: FileDetails[]): Promise<FileChange[]> {
    const changes: FileChange[] = [];
    for await (const change of this.analyzeFilesStream(files)) {
      changes.push(change);
    }
    return changes;
  }

  private buildPrompt(files: FileDetails[]): string {
    const fileList = files.map(file => ({
      name: file.name,
      type: file.type,
      size: this.formatSize(file.size),
      lastModified: file.lastModified.toISOString()
    }));

    return `As an AI file organizer, analyze these files and suggest how to organize them into a clear directory structure:
${JSON.stringify(fileList, null, 2)}

Consider:
1. File types and extensions
2. Common naming patterns
3. File creation/modification dates
4. Potential categories or themes

Respond with a JSON array of objects, each containing:
{
  "fileName": "original file name",
  "suggestedPath": "proposed/directory/structure/filename",
  "reason": "explanation for this organization"
}

Keep paths relative and use forward slashes. Group similar files together.`;
  }

  private parseResponse(response: string, originalFiles: FileDetails[]): FileChange[] {
    try {
      // Extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      
      return suggestions.map((suggestion: any) => {
        const originalFile = originalFiles.find(f => f.name === suggestion.fileName);
        if (!originalFile) {
          throw new Error(`No matching file found for ${suggestion.fileName}`);
        }

        return {
          originalPath: originalFile.path,
          newPath: suggestion.suggestedPath,
          reason: suggestion.reason
        };
      });
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse AI suggestions');
    }
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }
}
