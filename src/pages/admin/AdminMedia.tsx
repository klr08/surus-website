import React, { useState, useEffect } from 'react';
import FileUpload from '../../components/admin/FileUpload';
import { FileUploadService } from '../../services/fileUpload';
import { MediaFile } from '../../types/content';
import { Publisher } from '../../services/publisher';

export default function AdminMedia(): JSX.Element {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load media files from localStorage on component mount
  useEffect(() => {
    setMediaFiles(FileUploadService.getFiles());
  }, []);

  const handleUpload = (url: string, filename: string): void => {
    // Refresh the list of files after upload
    setMediaFiles(FileUploadService.getFiles());
    setMessage({ text: `${filename} uploaded successfully`, type: 'success' });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleDelete = (fileId: string): void => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const success = FileUploadService.deleteFile(fileId);
      if (success) {
        setMediaFiles(FileUploadService.getFiles());
        setMessage({ text: 'File deleted successfully', type: 'success' });
      } else {
        setMessage({ text: 'Failed to delete file', type: 'error' });
      }
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const handlePublish = async (): Promise<void> => {
    setIsPublishing(true);
    setMessage(null);
    
    try {
      await publishMedia(mediaFiles);
      setMessage({ text: 'Media files published successfully', type: 'success' });
    } catch (error) {
      setMessage({ 
        text: `Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="admin-media">
      <div className="admin-header">
        <h1>Media Management</h1>
        <p>Upload and manage images, logos, and other media files</p>
        
        <div className="admin-actions">
          <button 
            className="publish-button" 
            onClick={handlePublish}
            disabled={isPublishing || mediaFiles.length === 0}
          >
            {isPublishing ? 'Publishing...' : 'Publish to GitHub'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="upload-section">
        <h2>Upload New Files</h2>
        <FileUpload 
          onUpload={handleUpload} 
          accept="image/*" 
          multiple={true}
          label="Upload Logo Files"
        />
        <p className="upload-note">
          Recommended: Upload logo files in SVG format for best quality. PNG files should be at least 200px wide.
        </p>
      </div>

      <div className="media-library">
        <h2>Media Library</h2>
        
        {mediaFiles.length === 0 ? (
          <div className="empty-state">
            <p>No media files uploaded yet</p>
          </div>
        ) : (
          <div className="media-grid">
            {mediaFiles.map((file) => (
              <div key={file.id} className="media-item">
                {file.mimeType.startsWith('image/') ? (
                  <div className="media-preview">
                    <img src={file.url} alt={file.originalName} />
                  </div>
                ) : (
                  <div className="media-preview file-icon">
                    📄
                  </div>
                )}
                <div className="media-info">
                  <div className="media-name" title={file.originalName}>
                    {file.originalName.length > 20 
                      ? `${file.originalName.substring(0, 17)}...` 
                      : file.originalName}
                  </div>
                  <div className="media-meta">
                    {FileUploadService.formatFileSize(file.size)}
                  </div>
                </div>
                <div className="media-actions">
                  <button 
                    className="copy-button" 
                    onClick={() => {
                      navigator.clipboard.writeText(file.url);
                      setMessage({ text: 'URL copied to clipboard', type: 'success' });
                      setTimeout(() => setMessage(null), 3000);
                    }}
                    title="Copy URL"
                  >
                    📋
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(file.id)}
                    title="Delete file"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="usage-instructions">
        <h3>How to use uploaded logos</h3>
        <ol>
          <li>Upload your logo files using the form above</li>
          <li>Click the clipboard icon to copy the file URL</li>
          <li>Click "Publish to GitHub" to save files permanently</li>
          <li>After publishing, your logos will be available at: <code>/images/uploads/[filename]</code></li>
        </ol>
      </div>
    </div>
  );
}
