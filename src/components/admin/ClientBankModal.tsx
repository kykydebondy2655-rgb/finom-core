import React, { useState, useEffect } from 'react';
import Button from '@/components/finom/Button';
import { isValidIBAN, isValidBIC } from '@/lib/validators';
import logger from '@/lib/logger';
import '@/styles/components.css';

interface ClientBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  currentBalance: number | null;
  currentIban: string | null;
  currentBic: string | null;
  clientName: string;
}

const ClientBankModal: React.FC<ClientBankModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  currentBalance,
  currentIban,
  currentBic,
  clientName
}) => {
  const [balance, setBalance] = useState<string>('');
  const [iban, setIban] = useState<string>('');
  const [bic, setBic] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBalance(currentBalance?.toString() || '0');
      setIban(currentIban || '');
      setBic(currentBic || '');
      setError(null);
    }
  }, [isOpen, currentBalance, currentIban, currentBic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setError(null);

    // Require IBAN and BIC
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    const cleanBic = bic.replace(/\s/g, '').toUpperCase();

    if (!cleanIban) {
      setError('L\'IBAN est requis');
      return;
    }

    if (!isValidIBAN(cleanIban)) {
      setError('Format IBAN invalide');
      return;
    }

    if (!cleanBic) {
      setError('Le BIC est requis');
      return;
    }

    if (!isValidBIC(cleanBic)) {
      setError('Format BIC invalide (8 ou 11 caractères)');
      return;
    }

    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance) || numericBalance < 0) {
      setError('Le solde doit être un nombre positif');
      return;
    }

    setLoading(true);
    try {
      const { adminApi } = await import('@/services/api');
      await adminApi.updateClientBankAccount(clientId, {
        balance: numericBalance,
        iban: cleanIban,
        bic: cleanBic
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      logger.logError('Error updating bank account', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💳 Modifier le compte bancaire</h2>
          <p className="modal-subtitle">Client: {clientName}</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          
          <div className="form-group">
            <label>Solde (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              placeholder="0.00"
              className="form-input"
            />
            <span className="form-hint">Montant actuellement disponible sur le compte</span>
          </div>

          <div className="form-group">
            <label>IBAN *</label>
            <input
              type="text"
              value={iban}
              onChange={e => setIban(e.target.value.toUpperCase())}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              className="form-input"
              maxLength={34}
              required
            />
            <span className="form-hint">Format: FR76 suivi de 23 chiffres</span>
          </div>

          <div className="form-group">
            <label>BIC / SWIFT *</label>
            <input
              type="text"
              value={bic}
              onChange={e => setBic(e.target.value.toUpperCase())}
              placeholder="BNPAFRPP"
              className="form-input"
              maxLength={11}
              required
            />
            <span className="form-hint">Code banque (8 ou 11 caractères)</span>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientBankModal;
