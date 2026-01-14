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

const CATEGORY_ICONS: Record<string, string> = {
  offre_pret: '📋',
  attestation: '📜',
  contrat: '📝',
  echeancier: '📊',
  avenant: '📑',
  courrier: '✉️',
  autre: '📄',
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
        .select('id, file_name, file_path, category, motif, uploaded_at, status')
        .eq('user_id', user.id)
        .eq('direction', 'incoming')
        .order('uploaded_at', { ascending: false });

      if (loanId) {
        query = query.eq('loan_id', loanId);
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
        <style>{styles}</style>
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
          <h3>📥 Documents reçus</h3>
          <span className="doc-count">{documents.length} document{documents.length > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc.id} className="document-item received">
            <div className="doc-icon">
              {CATEGORY_ICONS[doc.category || 'autre'] || '📄'}
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
                {downloading === doc.id ? '⏳' : '⬇️'} Télécharger
              </Button>
            </div>
          </div>
        ))}
      </div>

      <style>{styles}</style>
    </Card>
  );
});

ReceivedDocumentsList.displayName = 'ReceivedDocumentsList';

const styles = `
  .received-docs-card {
    margin-top: 1.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }

  .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .doc-count {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    background: #f1f5f9;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    color: var(--color-text-secondary);
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .documents-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .document-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border: 1px solid #bbf7d0;
    border-radius: var(--radius-md);
    transition: all 0.2s;
  }

  .document-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
  }

  .doc-icon {
    font-size: 1.75rem;
    flex-shrink: 0;
  }

  .doc-content {
    flex: 1;
    min-width: 0;
  }

  .doc-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .doc-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-text-primary);
  }

  .doc-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
  }

  .doc-separator {
    opacity: 0.5;
  }

  .doc-category {
    background: white;
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-sm);
    font-weight: 500;
  }

  .doc-motif {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    margin: 0;
    padding: 0.5rem;
    background: white;
    border-radius: var(--radius-sm);
    border-left: 3px solid #22c55e;
  }

  .doc-actions {
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .document-item {
      flex-direction: column;
      gap: 0.75rem;
    }

    .doc-actions {
      width: 100%;
    }

    .doc-actions button {
      width: 100%;
    }
  }
`;

export default ReceivedDocumentsList;
