/**
 * Modal for admin to upload documents to send to clients
 */

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Button from '@/components/finom/Button';
import { useToast } from '@/components/finom/Toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';

interface AdminDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
  loanId?: string;
}

const DOCUMENT_CATEGORIES = [
  { value: 'offre_pret', label: 'Offre de prêt' },
  { value: 'attestation', label: 'Attestation' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'echeancier', label: 'Échéancier' },
  { value: 'avenant', label: 'Avenant' },
  { value: 'courrier', label: 'Courrier officiel' },
  { value: 'autre', label: 'Autre document' },
];

const AdminDocumentUploadModal: React.FC<AdminDocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  clientName,
  loanId
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('offre_pret');
  const [motif, setMotif] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill name from file if empty
      if (!fileName) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setFileName(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !fileName.trim() || !motif.trim() || !user) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setUploading(true);
      setProgress(20);

      // Create file path: clientId/incoming/timestamp_filename
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${clientId}/incoming/${timestamp}_${safeName}`;

      // Upload to storage
      setProgress(40);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erreur upload: ${uploadError.message}`);
      }

      setProgress(70);

      // Create document record in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: clientId,
          loan_id: loanId || null,
          file_name: fileName.trim(),
          file_path: uploadData.path,
          file_type: file.type,
          category: category,
          direction: 'incoming',
          motif: motif.trim(),
          uploaded_by: user.id,
          status: 'approved' // Admin documents are pre-approved
        });

      if (dbError) {
        throw new Error(`Erreur base de données: ${dbError.message}`);
      }

      setProgress(90);

      // Create notification for client
      await supabase
        .from('notifications')
        .insert({
          user_id: clientId,
          type: 'document',
          category: 'document',
          title: 'Nouveau document disponible',
          message: `Un nouveau document "${fileName}" a été ajouté à votre dossier. Motif: ${motif}`,
          related_entity: 'document',
          related_id: loanId || null
        });

      setProgress(100);
      toast.success('Document envoyé au client avec succès');
      
      // Reset form
      setFileName('');
      setCategory('offre_pret');
      setMotif('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      onSuccess();
      onClose();
    } catch (err) {
      logger.logError('Upload error', err);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du document');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFileName('');
      setCategory('offre_pret');
      setMotif('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>📤 Envoyer un document au client</DialogTitle>
          <DialogDescription>
            Ce document sera disponible dans l'espace client de <strong>{clientName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="admin-doc-upload-form">
          {/* File Input */}
          <div className="form-group">
            <label htmlFor="file">Fichier *</label>
            <input
              ref={fileInputRef}
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              required
              disabled={uploading}
            />
            {file && (
              <span className="file-info">
                📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} Mo)
              </span>
            )}
          </div>

          {/* Document Name */}
          <div className="form-group">
            <label htmlFor="fileName">Nom du document *</label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Ex: Offre de prêt définitive"
              required
              disabled={uploading}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Catégorie *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Motif */}
          <div className="form-group">
            <label htmlFor="motif">Motif / Description *</label>
            <textarea
              id="motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Suite à votre demande de prêt, veuillez trouver ci-joint l'offre définitive..."
              rows={3}
              required
              disabled={uploading}
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-text">{progress}% - Envoi en cours...</span>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={uploading || !file || !fileName.trim() || !motif.trim()}
            >
              {uploading ? 'Envoi en cours...' : '📤 Envoyer au client'}
            </Button>
          </div>
        </form>

        <style>{`
          .admin-doc-upload-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            padding-top: 1rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--color-text-primary);
          }

          .form-group input[type="text"],
          .form-group input[type="file"],
          .form-group select,
          .form-group textarea {
            padding: 0.75rem 1rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-size: 0.95rem;
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .form-group input:focus,
          .form-group select:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(254, 66, 180, 0.1);
          }

          .form-group input:disabled,
          .form-group select:disabled,
          .form-group textarea:disabled {
            background: #f5f5f5;
            cursor: not-allowed;
          }

          .form-group textarea {
            resize: vertical;
            min-height: 80px;
          }

          .file-info {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .upload-progress {
            padding: 1rem;
            background: #f8fafc;
            border-radius: var(--radius-md);
          }

          .progress-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: var(--radius-full);
            overflow: hidden;
            margin-bottom: 0.5rem;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, var(--color-primary) 0%, #ec4899 100%);
            border-radius: var(--radius-full);
            transition: width 0.3s ease;
          }

          .progress-text {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--color-border);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDocumentUploadModal;
