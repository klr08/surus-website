// Enhanced File upload service for Surus CMS with better quota handling
import { v4 as uuidv4 } from 'uuid';
import { Result, Ok, Err } from '../types/common';
import { MediaFile } from '../types/content';

export interface UploadResult {
  file: MediaFile;
  url: string;
}

export class EnhancedFileUpload {
  private static readonly STORAGE_KEY = 'surus_cms_files';
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB (reduced for localStorage)
  private static readonly MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB for images specifically
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
      // Validate file size based on type
      const isImage = file.type.startsWith('image/');
      const maxSize = isImage ? this.MAX_IMAGE_SIZE : this.MAX_FILE_SIZE;
      const maxSizeText = isImage ? '1MB' : '2MB';
      
      if (file.size > maxSize) {
        return Err(`File size exceeds ${maxSizeText} limit. Please compress the image before uploading.`);
      }

      // Validate file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        return Err('File type not supported');
      }

      // For images, compress them before storing
      let processedFile = file;
      if (isImage) {
        try {
          processedFile = await this.compressImage(file);
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError);
          // Continue with original file if compression fails
        }
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueId = uuidv4();
      const filename = `${uniqueId}.${fileExtension}`;

      // Convert file to base64 for storage
      const base64Data = await this.fileToBase64(processedFile);

      const mediaFile: MediaFile = {
        id: uniqueId as any,
        filename,
        originalName: file.name,
        url: base64Data,
        mimeType: file.type,
        size: processedFile.size,
        uploadedAt: new Date().toISOString(),
      };

      // Store in localStorage with quota handling
      const saveResult = this.saveFile(mediaFile);
      if (!saveResult.success) {
        return Err(saveResult.error);
      }

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

  private static saveFile(file: MediaFile): Result<boolean, string> {
    try {
      // First try to clean up storage
      this.cleanupStorage();
      
      const files = this.getFiles();
      
      // Check if we're trying to save a duplicate (by original name)
      const existingFileIndex = files.findIndex(f => f.originalName === file.originalName);
      if (existingFileIndex >= 0) {
        // Replace the existing file instead of adding a new one
        files[existingFileIndex] = file;
      } else {
        // Add as new file
        files.push(file);
      }
      
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
        return Ok(true);
      } catch (quotaError) {
        if (quotaError instanceof Error && (quotaError.name === 'QuotaExceededError' || quotaError.message.includes('quota'))) {
          // Try more aggressive cleanup - keep only recent files
          const recentFiles = this.getRecentFiles(5);
          
          // Make sure our new file is included
          const hasNewFile = recentFiles.some(f => f.id === file.id);
          if (!hasNewFile) {
            recentFiles.pop(); // Remove the oldest of the recent files
            recentFiles.unshift(file); // Add our new file at the beginning
          }
          
          try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentFiles));
            return Ok(true);
          } catch (secondError) {
            // Last resort - try with just this file
            try {
              localStorage.setItem(this.STORAGE_KEY, JSON.stringify([file]));
              return Ok(true);
            } catch (finalError) {
              return Err('Storage quota exceeded. Please publish existing content first to free up space.');
            }
          }
        } else {
          throw quotaError;
        }
      }
    } catch (error) {
      return Err(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get the most recent N files
  private static getRecentFiles(count: number): MediaFile[] {
    const files = this.getFiles();
    return files
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, count);
  }

  // Clean up storage by removing unused files
  private static cleanupStorage(): void {
    try {
      const files = this.getFiles();
      
      // If we have more than 20 files, keep only the most recent 10
      if (files.length > 20) {
        const recentFiles = this.getRecentFiles(10);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentFiles));
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  // Compress image to reduce size
  private static async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        // Target max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image on canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with reduced quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          0.7 // 70% quality - good balance between size and quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image for compression'));
      };
    });
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

  // Clear all uploaded files from localStorage
  static clearAllFiles(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
