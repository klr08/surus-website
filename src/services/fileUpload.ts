// File upload service for Surus CMS
import { v4 as uuidv4 } from 'uuid';
import { Result, Ok, Err } from '../types/common';
import { MediaFile } from '../types/content';

export interface UploadResult {
  file: MediaFile;
  url: string;
}

export class FileUploadService {
  private static readonly STORAGE_KEY = 'surus_cms_files';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'application/pdf'
  ];

  static async uploadFile(file: File): Promise<Result<UploadResult, string>> {
    try {
      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        return Err('File size exceeds 10MB limit');
      }

      // Validate file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        return Err('File type not supported');
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueId = uuidv4();
      const filename = `${uniqueId}.${fileExtension}`;

      // Convert file to base64 for storage
      const base64Data = await this.fileToBase64(file);

      const mediaFile: MediaFile = {
        id: uniqueId as any,
        filename,
        originalName: file.name,
        url: base64Data,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      // Store in localStorage
      this.saveFile(mediaFile);

      return Ok({
        file: mediaFile,
        url: base64Data,
      });
    } catch (error) {
      return Err(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static getFiles(): MediaFile[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static deleteFile(fileId: string): boolean {
    try {
      const files = this.getFiles();
      const filtered = files.filter(f => f.id !== fileId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  private static saveFile(file: MediaFile): void {
    const files = this.getFiles();
    files.push(file);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
