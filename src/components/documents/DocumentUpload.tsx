/**
 * Component to upload documents with drag & drop support
 * Includes camera capture for mobile devices
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import { documentsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { FileText, CheckCircle2, Camera, Smartphone } from 'lucide-react';
import CameraCapture from './CameraCapture';
import type { Document } from '@/services/api';

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
  showCameraOption?: boolean; // Enable camera capture on mobile
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
  showCameraOption = true,
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice || (isTouchDevice && window.innerWidth < 768));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

    // Check type - camera captures are always jpeg
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      return null;
    }

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
        const docRecord: Partial<Document> = {
          user_id: user.id,
          loan_id: loanId || undefined,
          file_name: file.name,
          file_path: result.path,
          file_type: file.type,
          category: documentCategory,
          status: 'pending',
          document_owner: documentOwner,
        };
        await documentsApi.upload(docRecord as Document);
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

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    uploadFile(file);
  };

  const canOpenCamera = showCameraOption && isMobile && (showTypeSelector ? selectedType : true);

  return (
    <>
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

        {/* Upload Methods */}
        <div className={`upload-methods ${isMobile && showCameraOption ? 'mobile-layout' : ''}`}>
          {/* Camera Button - Mobile Only */}
          {showCameraOption && isMobile && (
            <button
              type="button"
              onClick={() => canOpenCamera && setShowCamera(true)}
              disabled={uploading || !canOpenCamera}
              className={`camera-capture-btn ${!canOpenCamera ? 'disabled' : ''}`}
            >
              <div className="camera-icon-wrapper">
                <Camera className="w-8 h-8" />
              </div>
              <span className="camera-label">Scanner avec la caméra</span>
              <span className="camera-hint">
                <Smartphone className="w-3 h-3 inline mr-1" />
                Capture directe
              </span>
            </button>
          )}

          {/* Drag & Drop Zone */}
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
              className="hidden-input"
              disabled={uploading}
            />

            {uploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-text">
                  {progress < 100 ? 'Envoi en cours...' : <><CheckCircle2 size={14} className="inline mr-1" /> Terminé !</>}
                </span>
              </div>
            ) : (
              <>
                <div className="upload-icon"><FileText size={32} /></div>
                <p className="upload-text">
                  {showTypeSelector && !selectedType ? (
                    <>Sélectionnez d'abord le type de document</>
                  ) : (
                    <>
                      {isMobile ? 'Appuyez pour sélectionner un fichier' : 'Glissez-déposez un fichier ici'}
                      <br />
                      <span>{isMobile ? 'depuis votre appareil' : 'ou cliquez pour sélectionner'}</span>
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
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
};

export default DocumentUpload;
