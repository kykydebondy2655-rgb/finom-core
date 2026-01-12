import React, { useState, useEffect } from 'react';
import Button from '@/components/finom/Button';
import { isValidIBAN, isValidBIC } from '@/lib/validators';

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
    setError(null);

    // Validate IBAN if provided
    if (iban && !isValidIBAN(iban)) {
      setError('Format IBAN invalide');
      return;
    }

    // Validate BIC if provided
    if (bic && !isValidBIC(bic)) {
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
        iban: iban.replace(/\s/g, '').toUpperCase(),
        bic: bic.replace(/\s/g, '').toUpperCase()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating bank account:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
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
            <label>IBAN</label>
            <input
              type="text"
              value={iban}
              onChange={e => setIban(e.target.value.toUpperCase())}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              className="form-input"
              maxLength={34}
            />
            <span className="form-hint">Format: FR76 suivi de 23 chiffres</span>
          </div>

          <div className="form-group">
            <label>BIC / SWIFT</label>
            <input
              type="text"
              value={bic}
              onChange={e => setBic(e.target.value.toUpperCase())}
              placeholder="BNPAFRPP"
              className="form-input"
              maxLength={11}
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

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }
          .modal-content {
            background: white;
            border-radius: var(--radius-lg);
            max-width: 480px;
            width: 100%;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
            animation: modalIn 0.2s ease-out;
          }
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--color-border);
            position: relative;
          }
          .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
          }
          .modal-subtitle {
            margin: 0.25rem 0 0;
            color: var(--color-text-secondary);
            font-size: 0.9rem;
          }
          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--color-text-tertiary);
          }
          form {
            padding: 1.5rem;
          }
          .error-msg {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-md);
            margin-bottom: 1rem;
            font-size: 0.9rem;
          }
          .form-group {
            margin-bottom: 1.25rem;
          }
          .form-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-size: 1rem;
          }
          .form-input:focus {
            outline: none;
            border-color: var(--color-admin);
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
          }
          .form-hint {
            display: block;
            font-size: 0.8rem;
            color: var(--color-text-tertiary);
            margin-top: 0.25rem;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding-top: 1rem;
            border-top: 1px solid var(--color-border);
          }
        `}</style>
      </div>
    </div>
  );
};

export default ClientBankModal;
