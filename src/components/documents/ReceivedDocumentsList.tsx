/**
 * Component to display documents received from admin (incoming documents)
 * Allows clients to download these documents and admins to delete them
 */

import React, { useState, useEffect, forwardRef } from 'react';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/finom/Toast';
import { useUserRoles } from '@/hooks/useUserRoles';
import { storageService } from '@/services/storageService';
import { formatDate } from '@/services/api';
import logger from '@/lib/logger';
import { ClipboardList, FileText, PenLine, BarChart3, FileStack, Mail, Download, Loader2, Inbox, Trash2 } from 'lucide-react';

interface ReceivedDocument {
  id: string;
  file_name: string;
  file_path: string;
  category: string | null;
  motif: string | null;
  uploaded_at: string;
  status: string | null;
  loan_id?: string | null;
}

interface ReceivedDocumentsListProps {
  loanId?: string;
  showTitle?: boolean;
  onRefresh?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  offre_pret: 'Offre de prêt',
  attestation: 'Attestation',
  contrat: 'Contrat',
  echeancier: 'Échéancier',
  avenant: 'Avenant',
  courrier: 'Courrier officiel',
  autre: 'Autre document',
};

const getCategoryIcon = (category: string | null): React.ReactNode => {
  const iconProps = { size: 18, className: 'doc-category-icon' };
  switch (category) {
    case 'offre_pret': return <ClipboardList {...iconProps} />;
    case 'attestation': return <FileText {...iconProps} />;
    case 'contrat': return <PenLine {...iconProps} />;
    case 'echeancier': return <BarChart3 {...iconProps} />;
    case 'avenant': return <FileStack {...iconProps} />;
    case 'courrier': return <Mail {...iconProps} />;
    default: return <FileText {...iconProps} />;
  }
};

const ReceivedDocumentsList = forwardRef<HTMLDivElement, ReceivedDocumentsListProps>(({ 
  loanId,
  showTitle = true,
  onRefresh
}, ref) => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const toast = useToast();
  const [documents, setDocuments] = useState<ReceivedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadDocuments();
    }
  }, [user?.id, loanId]);

  const loadDocuments = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // For admins, we may need to see documents for a specific loan even if user_id doesn't match
      let query = supabase
        .from('documents')
        .select('id, file_name, file_path, category, motif, uploaded_at, status, loan_id, user_id')
        .eq('direction', 'incoming')
        .order('uploaded_at', { ascending: false });

      if (loanId) {
        // If viewing a specific loan, show all incoming docs for that loan
        query = query.eq('loan_id', loanId);
      } else {
        // Otherwise, show user's own incoming documents
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        logger.warn('Error loading received documents', { error: error.message });
        return;
      }

      setDocuments(data || []);
    } catch (err) {
      logger.logError('Error loading documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: ReceivedDocument) => {
    try {
      setDownloading(doc.id);
      
      // Download as blob for reliable file download
      const result = await storageService.downloadDocument(doc.file_path);
      
      if (!result.success || !result.blob) {
        throw new Error(result.error || 'Impossible de récupérer le document');
      }

      // Create blob URL and trigger download
      const blobUrl = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL after short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      
      toast.success('Téléchargement terminé');
    } catch (err) {
      logger.logError('Download error', err);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(null);
    }
  };

  // Admin document deletion handler
  const handleDeleteDocument = async (doc: ReceivedDocument) => {
    if (!isAdmin) {
      toast.error('Seuls les administrateurs peuvent supprimer des documents');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${doc.file_name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setDeletingDocId(doc.id);

      // Delete from storage first
      const storageResult = await storageService.deleteDocument(doc.file_path);
      if (!storageResult.success) {
        logger.warn('Storage deletion failed', { error: storageResult.error });
        // Continue with DB deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) {
        throw new Error(dbError.message);
      }

      toast.success('Document supprimé avec succès');
      loadDocuments(); // Refresh list
      onRefresh?.(); // Notify parent to refresh
    } catch (err) {
      logger.logError('Document deletion error', err);
      toast.error('Erreur lors de la suppression du document');
    } finally {
      setDeletingDocId(null);
    }
  };

  if (loading) {
    return (
      <Card padding="lg" className="received-docs-card">
        <div className="loading-state">
          <div className="spinner" />
          <span>Chargement des documents...</span>
        </div>
      </Card>
    );
  }

  if (documents.length === 0) {
    return null; // Don't show empty section
  }

  return (
    <Card padding="lg" className="received-docs-card">
      {showTitle && (
        <div className="section-header">
          <h3><Inbox size={18} className="inline mr-2" />Documents reçus</h3>
          <span className="doc-count">{documents.length} document{documents.length > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc.id} className="document-item received">
            <div className="doc-icon">
              {getCategoryIcon(doc.category)}
            </div>
            <div className="doc-content">
              <div className="doc-header">
                <span className="doc-name">{doc.file_name}</span>
                <StatusBadge status={doc.status || 'approved'} size="sm" />
              </div>
              <div className="doc-meta">
                <span className="doc-category">
                  {CATEGORY_LABELS[doc.category || 'autre'] || doc.category}
                </span>
                <span className="doc-separator">•</span>
                <span className="doc-date">{formatDate(doc.uploaded_at)}</span>
              </div>
              {doc.motif && (
                <p className="doc-motif">{doc.motif}</p>
              )}
            </div>
            <div className="doc-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.id}
              >
                {downloading === doc.id ? <Loader2 size={14} className="animate-spin mr-1" /> : <Download size={14} className="mr-1" />}
                Télécharger
              </Button>
              {isAdmin && (
                <button
                  type="button"
                  className="doc-delete-btn"
                  onClick={() => handleDeleteDocument(doc)}
                  disabled={deletingDocId === doc.id}
                  title="Supprimer ce document"
                >
                  {deletingDocId === doc.id ? (
                    <span className="spinner-sm" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

ReceivedDocumentsList.displayName = 'ReceivedDocumentsList';

export default ReceivedDocumentsList;
