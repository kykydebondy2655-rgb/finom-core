import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/finom/Button';
import { emailService } from '@/services/emailService';
import { useToast } from '@/components/finom/Toast';
import logger from '@/lib/logger';
import { generateTempPassword } from '@/lib/securePassword';

interface SendAccountEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientEmail: string;
  clientFirstName: string;
}

const SendAccountEmailModal: React.FC<SendAccountEmailModalProps> = ({
  isOpen,
  onClose,
  clientEmail,
  clientFirstName,
}) => {
  const [sending, setSending] = useState(false);
  const toast = useToast();
  
  // Generate a secure password for this session
  const tempPassword = useMemo(() => generateTempPassword(), [isOpen]);

  const handleSendEmail = async () => {
    if (!clientEmail) {
      toast.error("L'email du client n'est pas défini");
      return;
    }

    setSending(true);
    try {
      const result = await emailService.sendAccountOpening(
        clientEmail,
        clientFirstName || 'Client',
        tempPassword
      );

      if (result.success) {
        toast.success('Email d\'ouverture de compte envoyé avec succès');
        onClose();
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      logger.logError('Error sending account email', err);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>📧 Envoyer email d'ouverture de compte</DialogTitle>
          <DialogDescription>
            Un email contenant les identifiants de connexion sera envoyé au client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Destinataire</span>
              <span className="font-medium">{clientEmail}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Prénom</span>
              <span className="font-medium">{clientFirstName || 'Non défini'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mot de passe temporaire</span>
              <code className="bg-background px-2 py-1 rounded text-sm font-mono">
                {tempPassword}
              </code>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              ⚠️ Le client devra changer ce mot de passe lors de sa première connexion.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSendEmail} disabled={sending || !clientEmail}>
            {sending ? 'Envoi en cours...' : '📧 Envoyer l\'email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendAccountEmailModal;
