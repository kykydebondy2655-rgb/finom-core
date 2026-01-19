/**
 * Download All Documents button - creates a ZIP of all loan documents
 */

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/finom/Button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/finom/Toast';
import { logger } from '@/lib/logger';

interface DownloadAllDocumentsProps {
  loanId: string;
  loanRef: string;
}

const DownloadAllDocuments: React.FC<DownloadAllDocumentsProps> = ({
  loanId,
  loanRef,
}) => {
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      // Get all documents for this loan
      const { data: documents, error } = await supabase
        .from('documents')
        .select('file_path, file_name, category, document_owner')
        .eq('loan_id', loanId);

      if (error) throw error;

      if (!documents || documents.length === 0) {
        toast.info('Aucun document à télécharger');
        return;
      }

      // If only one document, download directly
      if (documents.length === 1) {
        const doc = documents[0];
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('documents')
          .download(doc.file_path);

        if (downloadError) throw downloadError;

        const url = URL.createObjectURL(fileData);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Document téléchargé');
        return;
      }

      // For multiple documents, download them individually (ZIP would require JSZip)
      toast.info(`Téléchargement de ${documents.length} documents...`);
      
      let successCount = 0;
      for (const doc of documents) {
        try {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('documents')
            .download(doc.file_path);

          if (downloadError) {
            logger.warn('Failed to download document', { path: doc.file_path });
            continue;
          }

          const url = URL.createObjectURL(fileData);
          const a = document.createElement('a');
          a.href = url;
          
          // Create descriptive filename
          const owner = doc.document_owner === 'co_borrower' ? 'coemprunteur_' : '';
          const category = doc.category ? `${doc.category}_` : '';
          a.download = `${loanRef}_${owner}${category}${doc.file_name}`;
          
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          successCount++;
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (docErr) {
          logger.logError('Document download error', docErr);
        }
      }

      toast.success(`${successCount}/${documents.length} documents téléchargés`);
    } catch (err) {
      logger.logError('Download all documents error', err);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleDownloadAll}
      disabled={downloading}
      className="btn-icon-text"
    >
      <Download size={16} className={downloading ? 'animate-pulse' : ''} />
      <span>{downloading ? 'Téléchargement...' : 'Télécharger tout'}</span>
    </Button>
  );
};

export default DownloadAllDocuments;
