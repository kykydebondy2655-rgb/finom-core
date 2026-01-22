/**
 * Modal for bulk document status updates (validate/reject multiple documents at once)
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Button from '@/components/finom/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/finom/Toast';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';
import { CheckCircle2, XCircle, FileText, AlertTriangle, Search } from 'lucide-react';
import type { Document } from '@/services/api';
import StatusBadge from '@/components/common/StatusBadge';

interface BulkDocumentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documents: Document[];
  clientName?: string;
}

const BulkDocumentStatusModal: React.FC<BulkDocumentStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documents,
  clientName = 'le client'
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<'validated' | 'rejected' | 'under_review' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter only documents that can be updated (not already validated)
  const updatableDocuments = documents.filter(doc => 
    doc.status !== 'validated' && 
    (doc as any).direction !== 'incoming'
  );

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedDocs.size === updatableDocuments.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(updatableDocuments.map(d => d.id)));
    }
  };

  const handleSubmit = async () => {
    if (!action || selectedDocs.size === 0) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const selectedDocsList = documents.filter(d => selectedDocs.has(d.id));
      
      // Batch update all selected documents
      const updates = selectedDocsList.map(async (doc) => {
        const updateData: Record<string, unknown> = {
          status: action,
        };

        if (action === 'validated') {
          updateData.validated_at = now;
          updateData.validated_by = user?.id || null;
          updateData.rejection_reason = null;
        } else if (action === 'rejected') {
          updateData.rejection_reason = rejectionReason;
          updateData.validated_at = null;
          updateData.validated_by = null;
        } else if (action === 'under_review') {
          updateData.validated_at = null;
          updateData.validated_by = null;
          updateData.rejection_reason = null;
        }

        return supabase
          .from('documents')
          .update(updateData)
          .eq('id', doc.id);
      });

      await Promise.all(updates);

      // Create notifications for each document
      const getNotificationContent = (docName: string) => {
        if (action === 'validated') {
          return { title: 'Document validé', message: `Votre document "${docName}" a été validé. ✓` };
        } else if (action === 'rejected') {
          return { title: 'Document rejeté', message: `Votre document "${docName}" a été rejeté. Raison: ${rejectionReason}` };
        } else {
          return { title: 'Document en analyse', message: `Votre document "${docName}" est en cours d'analyse.` };
        }
      };

      const notifications = selectedDocsList.map(doc => {
        const content = getNotificationContent(doc.file_name);
        return {
          user_id: doc.user_id,
          type: 'document_status',
          category: 'document',
          title: content.title,
          message: content.message,
          related_entity: 'documents',
          related_id: doc.id,
        };
      });

      await supabase.from('notifications').insert(notifications);

      const actionLabel = action === 'validated' ? 'validé(s)' : action === 'rejected' ? 'rejeté(s)' : 'mis en analyse';
      toast.success(`${selectedDocs.size} document(s) ${actionLabel} avec succès`);
      
      // Reset and close
      setSelectedDocs(new Set());
      setAction(null);
      setRejectionReason('');
      onSuccess();
      onClose();
    } catch (err) {
      logger.logError('Bulk document update error', err);
      toast.error('Erreur lors de la mise à jour des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedDocs(new Set());
      setAction(null);
      setRejectionReason('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Traitement en masse des documents
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les documents de {clientName} à valider ou rejeter en une seule action.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Checkbox 
              id="select-all"
              checked={selectedDocs.size === updatableDocuments.length && updatableDocuments.length > 0}
              onCheckedChange={toggleAll}
            />
            <Label htmlFor="select-all" className="cursor-pointer font-medium">
              Tout sélectionner ({updatableDocuments.length} documents modifiables)
            </Label>
          </div>

          {/* Document List */}
          <div className="space-y-2">
            {updatableDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                <p>Aucun document modifiable</p>
                <p className="text-sm">Tous les documents sont déjà validés ou sont des documents entrants.</p>
              </div>
            ) : (
              updatableDocuments.map(doc => (
                <div 
                  key={doc.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedDocs.has(doc.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => toggleDocument(doc.id)}
                >
                  <Checkbox 
                    checked={selectedDocs.has(doc.id)}
                    onCheckedChange={() => toggleDocument(doc.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <FileText size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">{doc.category}</p>
                  </div>
                  <StatusBadge status={doc.status} size="sm" />
                </div>
              ))
            )}
          </div>

          {/* Action Selection */}
          {selectedDocs.size > 0 && (
            <div className="pt-4 border-t border-border space-y-4">
              <p className="font-medium">{selectedDocs.size} document(s) sélectionné(s) - Choisir une action :</p>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    action === 'validated' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                      : 'border-border hover:border-green-300'
                  }`}
                  onClick={() => setAction('validated')}
                >
                  <CheckCircle2 size={24} className="text-green-600 mb-2" />
                  <p className="font-medium text-green-700 dark:text-green-400">Valider tous</p>
                  <p className="text-xs text-muted-foreground">Marquer comme conformes</p>
                </button>

                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    action === 'under_review' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                      : 'border-border hover:border-blue-300'
                  }`}
                  onClick={() => setAction('under_review')}
                >
                  <Search size={24} className="text-blue-600 mb-2" />
                  <p className="font-medium text-blue-700 dark:text-blue-400">En analyse</p>
                  <p className="text-xs text-muted-foreground">Mettre en cours d'examen</p>
                </button>

                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    action === 'rejected' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/30' 
                      : 'border-border hover:border-red-300'
                  }`}
                  onClick={() => setAction('rejected')}
                >
                  <XCircle size={24} className="text-red-600 mb-2" />
                  <p className="font-medium text-red-700 dark:text-red-400">Rejeter tous</p>
                  <p className="text-xs text-muted-foreground">Demander un remplacement</p>
                </button>
              </div>

              {/* Rejection Reason */}
              {action === 'rejected' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Motif du rejet (appliqué à tous) *</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex: Document illisible, pièce expirée, informations manquantes..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant={action === 'rejected' ? 'danger' : 'primary'}
            onClick={handleSubmit}
            disabled={loading || selectedDocs.size === 0 || !action || (action === 'rejected' && !rejectionReason.trim())}
            isLoading={loading}
          >
            {action === 'validated' ? 'Valider' : action === 'rejected' ? 'Rejeter' : action === 'under_review' ? 'Analyser' : 'Confirmer'} ({selectedDocs.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDocumentStatusModal;
