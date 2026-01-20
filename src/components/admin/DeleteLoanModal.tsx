import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/finom/Button';
import { useToast } from '@/components/finom/Toast';
import { adminApi, formatCurrency } from '@/services/api';
import { AlertTriangle } from 'lucide-react';
import type { LoanApplication } from '@/services/api';

interface DeleteLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loan: LoanApplication | null;
}

const DeleteLoanModal: React.FC<DeleteLoanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loan
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const toast = useToast();

  const handleDelete = async () => {
    if (!loan || confirmText !== 'SUPPRIMER') return;

    try {
      setLoading(true);
      await adminApi.deleteLoan(loan.id);
      toast.success('Dossier supprimé avec succès');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting loan:', err);
      toast.error('Erreur lors de la suppression du dossier');
    } finally {
      setLoading(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} />
            Supprimer ce dossier
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes les données associées seront supprimées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Référence :</span>{' '}
              <strong>#{loan.id.slice(0, 8)}</strong>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Montant :</span>{' '}
              <strong>{formatCurrency(loan.amount)}</strong>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Statut :</span>{' '}
              <strong>{loan.status}</strong>
            </p>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-2">
              Les éléments suivants seront supprimés :
            </p>
            <ul className="text-sm text-destructive/80 list-disc pl-4 space-y-1">
              <li>Le dossier de prêt</li>
              <li>Tous les documents associés</li>
              <li>L'historique des statuts</li>
              <li>Les messages du dossier</li>
            </ul>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Tapez <strong>SUPPRIMER</strong> pour confirmer
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="SUPPRIMER"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading || confirmText !== 'SUPPRIMER'}
            isLoading={loading}
          >
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteLoanModal;
