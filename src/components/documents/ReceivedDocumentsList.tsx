/**
 * Component to display documents received from admin (incoming documents)
 * Allows clients to download these documents
 */

import React, { useState, useEffect, forwardRef } from 'react';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/finom/Toast';
import { storageService } from '@/services/storageService';
import { formatDate } from '@/services/api';
import logger from '@/lib/logger';
import { ClipboardList, FileText, PenLine, BarChart3, FileStack, Mail, Download, Loader2, Inbox } from 'lucide-react';

interface ReceivedDocument {
  id: string;
  file_name: string;
  file_path: string;
  category: string | null;
  motif: string | null;
  uploaded_at: string;
  status: string | null;
}

interface ReceivedDocumentsListProps {
  loanId?: string;
  showTitle?: boolean;
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
  showTitle = true 
}, ref) => {
  const { user } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<ReceivedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadDocuments();
    }
  }, [user?.id, loanId]);

  const loadDocuments = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('documents')
        .select('id, file_name, file_path, category, motif, uploaded_at, status, loan_id')
        .eq('user_id', user.id)
        .eq('direction', 'incoming')
        .order('uploaded_at', { ascending: false });

      // Show documents for this specific loan OR general documents (no loan_id)
      if (loanId) {
        query = query.or(`loan_id.eq.${loanId},loan_id.is.null`);
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
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

ReceivedDocumentsList.displayName = 'ReceivedDocumentsList';

export default ReceivedDocumentsList;
