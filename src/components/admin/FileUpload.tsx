import React, { useState, useRef } from 'react';
import { EnhancedFileUpload } from '../../services/enhancedFileUpload';

interface FileUploadProps {
  onUpload: (url: string, filename: string) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  maxSize?: number;
}

export default function FileUpload({ 
  onUpload, 
  accept = "image/*", 
  multiple = false, 
  label = "Upload File",
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps): JSX.Element {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await EnhancedFileUpload.uploadFile(file);
        if (result.success) {
          onUpload(result.data.url, result.data.file.originalName);
          return result.data;
        } else {
          throw new Error(result.error);
        }
      });

      await Promise.all(uploadPromises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(false);
  };

  const formatMaxSize = (bytes: number): string => {
    return EnhancedFileUpload.formatFileSize(bytes);
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="file-upload-input"
        disabled={uploading}
      />

      <div
        className={`file-upload-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Uploading...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <h4>{label}</h4>
            <p>Drag and drop files here, or click to select</p>
            <small>
              Max size: {formatMaxSize(maxSize)} • 
              {accept === 'image/*' ? ' Images only' : ` Accepted: ${accept}`}
            </small>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
}
