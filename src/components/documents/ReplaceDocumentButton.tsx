/**
 * Button to replace a rejected document
 */

import React, { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '@/components/finom/Button';
import { storageService } from '@/services/storageService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/finom/Toast';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';

interface ReplaceDocumentButtonProps {
  documentId: string;
  documentCategory: string;
  loanId?: string;
  documentOwner?: 'primary' | 'co_borrower';
  onSuccess: () => void;
}

const ReplaceDocumentButton: React.FC<ReplaceDocumentButtonProps> = ({
  documentId,
  documentCategory,
  loanId,
  documentOwner = 'primary',
  onSuccess,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Le fichier dépasse la taille maximale de 10 Mo');
      return;
    }

    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      toast.error('Type de fichier non autorisé');
      return;
    }

    setUploading(true);

    try {
      // Upload new file
      const result = await storageService.uploadDocument(
        user.id,
        file,
        loanId,
        documentCategory
      );

      if (!result.success || !result.path) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update the existing document record with new file info and reset status
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          file_name: file.name,
          file_path: result.path,
          file_type: file.type,
          status: 'pending',
          rejection_reason: null,
          uploaded_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      toast.success('Document remplacé avec succès');
      onSuccess();
    } catch (err) {
      logger.logError('Replace document error', err);
      toast.error('Erreur lors du remplacement du document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="btn-icon-text"
      >
        <RefreshCw size={14} className={uploading ? 'animate-spin' : ''} />
        <span>{uploading ? 'Envoi...' : 'Remplacer'}</span>
      </Button>
    </>
  );
};

export default ReplaceDocumentButton;
