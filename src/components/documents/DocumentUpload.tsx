/**
 * Component to upload documents with drag & drop support
 */

import React, { useState, useCallback, useRef } from 'react';
import Button from '@/components/finom/Button';
import { storageService } from '@/services/storageService';
import { documentsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface DocumentUploadProps {
  loanId?: string;
  category?: string;
  onUploadComplete?: (doc: { path: string; url?: string }) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  loanId,
  category,
  onUploadComplete,
  onError,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  maxSize = 10,
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    // Check size
    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier dépasse la taille maximale de ${maxSize} Mo`;
    }

    // Check type
    const allowedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const fileMime = file.type.toLowerCase();

    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExt === type;
      }
      return fileMime.includes(type);
    });

    if (!isValidType) {
      return 'Type de fichier non autorisé';
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      onError?.('Vous devez être connecté');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    try {
      setUploading(true);
      setProgress(10);

      // Upload to storage
      const result = await storageService.uploadDocument(
        user.id,
        file,
        loanId,
        category
      );

      setProgress(60);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Create document record in database
      if (result.path) {
        await documentsApi.upload({
          user_id: user.id,
          loan_id: loanId || null,
          file_name: file.name,
          file_path: result.path,
          file_type: file.type,
          category: category || 'other',
          status: 'pending',
        });
      }

      setProgress(100);

      onUploadComplete?.({
        path: result.path || '',
        url: result.url,
      });

      // Reset after success
      setTimeout(() => {
        setProgress(0);
        setUploading(false);
      }, 1000);
    } catch (err) {
      // Retry logic for network errors
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      onError?.(errorMessage);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [user, loanId, category]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="document-upload">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-text">
              {progress < 100 ? 'Envoi en cours...' : '✓ Terminé !'}
            </span>
          </div>
        ) : (
          <>
            <div className="upload-icon">📄</div>
            <p className="upload-text">
              Glissez-déposez un fichier ici
              <br />
              <span>ou cliquez pour sélectionner</span>
            </p>
            <p className="upload-hint">
              PDF, JPG, PNG • Max {maxSize} Mo
            </p>
          </>
        )}
      </div>

      <style>{`
        .document-upload {
          width: 100%;
        }

        .upload-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafafa;
        }

        .upload-zone:hover {
          border-color: var(--color-primary);
          background: rgba(254, 66, 180, 0.03);
        }

        .upload-zone.dragging {
          border-color: var(--color-primary);
          background: rgba(254, 66, 180, 0.08);
          transform: scale(1.01);
        }

        .upload-zone.uploading {
          cursor: default;
          pointer-events: none;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-text {
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        .upload-text span {
          color: var(--color-primary);
          font-weight: 600;
        }

        .upload-hint {
          font-size: 0.8rem;
          color: var(--color-text-tertiary);
        }

        .upload-progress {
          padding: 1rem 0;
        }

        .progress-bar {
          height: 8px;
          background: #e5e5e5;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), #D61F8D);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-weight: 600;
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
};

export default DocumentUpload;
