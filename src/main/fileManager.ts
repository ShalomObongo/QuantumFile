import * as fs from 'fs/promises';
import * as path from 'path';
import { FileDetails, FolderContents, FileOperation } from './ipc';

export class FileManager {
  private folderPath: string = '';
  private files: FileDetails[] = [];

  async scanFolder(folderPath: string): Promise<FolderContents> {
    this.folderPath = folderPath;
    
    try {
      const entries = await fs.readdir(folderPath, { withFileTypes: true });
      
      this.files = await Promise.all(
        entries
          .filter(entry => entry.isFile())
          .map(async (entry) => {
            const filePath = path.join(folderPath, entry.name);
            const stats = await fs.stat(filePath);
            return {
              name: entry.name,
              path: filePath,
              size: stats.size,
              type: path.extname(entry.name).toLowerCase(),
              lastModified: stats.mtime
            };
          })
      );

      return {
        folderPath: this.folderPath,
        files: this.files
      };
    } catch (error: unknown) {
      console.error('Error scanning folder:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to scan folder: ${error.message}`);
      }
      throw new Error('Failed to scan folder: Unknown error');
    }
  }

  async applyChanges(operations: FileOperation[]): Promise<void> {
    for (const operation of operations) {
      try {
        // Validate paths
        if (!operation.sourcePath || !operation.destinationPath) {
          throw new Error('Invalid source or destination path');
        }

        // Check if source exists
        await fs.access(operation.sourcePath);

        // Create destination directory structure
        const destDir = path.dirname(operation.destinationPath);
        await fs.mkdir(destDir, { recursive: true });

        // Move file
        await fs.rename(operation.sourcePath, operation.destinationPath);
      } catch (error: unknown) {
        console.error(`Error moving file ${operation.sourcePath}:`, error);
        if (error instanceof Error) {
          throw new Error(`Failed to move file: ${error.message}`);
        }
        throw new Error('Failed to move file: Unknown error');
      }
    }
  }

  async validateChanges(operations: FileOperation[]): Promise<boolean> {
    try {
      for (const operation of operations) {
        // Check if source exists
        await fs.access(operation.sourcePath);

        // Check if destination already exists
        try {
          await fs.access(operation.destinationPath);
          throw new Error(`Destination already exists: ${operation.destinationPath}`);
        } catch (error: unknown) {
          // Destination doesn't exist, which is what we want
          if (error instanceof Error && 'code' in error && (error as {code: string}).code !== 'ENOENT') {
            throw error;
          }
        }

        // Check if we have write permission to destination directory
        const destDir = path.dirname(operation.destinationPath);
        try {
          await fs.access(destDir, fs.constants.W_OK);
        } catch {
          // Try to create the directory if it doesn't exist
          await fs.mkdir(destDir, { recursive: true });
        }
      }
      return true;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  }

  async getFileContent(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error: unknown) {
      console.error('Error reading file:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to read file: ${error.message}`);
      }
      throw new Error('Failed to read file: Unknown error');
    }
  }

  async getFileStats(filePath: string): Promise<FileDetails> {
    try {
      const stats = await fs.stat(filePath);
      return {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        type: path.extname(filePath).toLowerCase(),
        lastModified: stats.mtime
      };
    } catch (error: unknown) {
      console.error('Error getting file stats:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get file stats: ${error.message}`);
      }
      throw new Error('Failed to get file stats: Unknown error');
    }
  }

  async createBackup(operations: FileOperation[]): Promise<string> {
    const backupDir = path.join(this.folderPath, '.quantum_backup');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, timestamp);

    try {
      await fs.mkdir(backupPath, { recursive: true });

      for (const operation of operations) {
        const backupFilePath = path.join(
          backupPath,
          path.relative(this.folderPath, operation.sourcePath)
        );
        const backupFileDir = path.dirname(backupFilePath);
        
        await fs.mkdir(backupFileDir, { recursive: true });
        await fs.copyFile(operation.sourcePath, backupFilePath);
      }

      return backupPath;
    } catch (error: unknown) {
      console.error('Error creating backup:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create backup: ${error.message}`);
      }
      throw new Error('Failed to create backup: Unknown error');
    }
  }

  async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      const files = await this.scanFolder(backupPath);
      const operations = files.files.map(file => ({
        sourcePath: file.path,
        destinationPath: path.join(
          this.folderPath,
          path.relative(backupPath, file.path)
        )
      }));

      await this.applyChanges(operations);
    } catch (error: unknown) {
      console.error('Error restoring from backup:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to restore from backup: ${error.message}`);
      }
      throw new Error('Failed to restore from backup: Unknown error');
    }
  }
}