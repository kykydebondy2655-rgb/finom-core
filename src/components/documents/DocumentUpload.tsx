/**
 * Component to upload documents with drag & drop support
 */

import React, { useState, useCallback, useRef } from 'react';
import Button from '@/components/finom/Button';
import { storageService } from '@/services/storageService';
import { documentsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

// Document types for the checklist matching
const DOCUMENT_TYPES = [
  { id: 'id_card', label: 'Pièce d\'identité' },
  { id: 'proof_of_address', label: 'Justificatif de domicile' },
  { id: 'tax_notice', label: 'Avis d\'imposition' },
  { id: 'payslips', label: 'Bulletins de salaire' },
  { id: 'employment_contract', label: 'Contrat de travail' },
  { id: 'bank_statements', label: 'Relevés bancaires' },
  { id: 'existing_loans', label: 'Tableau d\'amortissement' },
  { id: 'compromise', label: 'Compromis de vente' },
  { id: 'property_diagnostics', label: 'Diagnostics immobiliers' },
  { id: 'primary_residence_proof', label: 'Justificatif résidence principale' },
  { id: 'rental_estimation', label: 'Estimation locative' },
  { id: 'existing_rentals', label: 'Baux existants' },
  { id: 'land_compromise', label: 'Compromis terrain' },
  { id: 'building_permit', label: 'Permis de construire' },
  { id: 'construction_contract', label: 'Contrat de construction' },
  { id: 'construction_plans', label: 'Plans de la maison' },
  { id: 'insurance_dommage', label: 'Assurance dommages-ouvrage' },
  { id: 'property_title', label: 'Titre de propriété' },
  { id: 'renovation_quotes', label: 'Devis travaux' },
  { id: 'renovation_plans', label: 'Plans / descriptif travaux' },
  { id: 'other', label: 'Autre document' },
];

export interface DocumentUploadProps {
  loanId?: string;
  category?: string;
  documentOwner?: 'primary' | 'co_borrower';
  onUploadComplete?: (doc: { path: string; url?: string }) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  showTypeSelector?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  loanId,
  category,
  documentOwner = 'primary',
  onUploadComplete,
  onError,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  maxSize = 10,
  showTypeSelector = true,
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('');
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

    // Require document type selection when selector is shown
    if (showTypeSelector && !selectedType) {
      onError?.('Veuillez sélectionner le type de document');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    // Use selected type or fallback to category prop
    const documentCategory = showTypeSelector ? selectedType : (category || 'other');

    try {
      setUploading(true);
      setProgress(10);

      // Upload to storage
      const result = await storageService.uploadDocument(
        user.id,
        file,
        loanId,
        documentCategory
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
          category: documentCategory,
          status: 'pending',
          document_owner: documentOwner,
        } as any);
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
        setSelectedType('');
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

    // Prevent multiple uploads while one is in progress
    if (uploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loanId, category, uploading, selectedType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent multiple uploads while one is in progress
    if (uploading) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="document-upload">
      {/* Document Type Selector */}
      {showTypeSelector && (
        <div className="type-selector">
          <label className="type-label">Type de document *</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-select"
            disabled={uploading}
          >
            <option value="">-- Sélectionnez le type --</option>
            {DOCUMENT_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>
      )}

      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''} ${showTypeSelector && !selectedType ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && (showTypeSelector ? selectedType : true) && fileInputRef.current?.click()}
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
              {showTypeSelector && !selectedType ? (
                <>Sélectionnez d'abord le type de document</>
              ) : (
                <>
                  Glissez-déposez un fichier ici
                  <br />
                  <span>ou cliquez pour sélectionner</span>
                </>
              )}
            </p>
            <p className="upload-hint">
              PDF, JPG, PNG • Max {maxSize} Mo
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
