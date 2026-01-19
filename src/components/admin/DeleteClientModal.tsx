import React, { useState } from 'react';
import Button from '@/components/finom/Button';
import { adminApi, Profile } from '@/services/api';
import logger from '@/lib/logger';
import { AlertTriangle } from 'lucide-react';

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client: Profile;
}

const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  client
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminApi.deleteClient(client.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      logger.logError('Error deleting client', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="danger">Supprimer ce client ?</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body centered">
          <div className="warning-icon"><AlertTriangle size={32} className="text-amber-500" /></div>
          <p className="warning-text">
            Cette action est irréversible.
          </p>
          
          <div className="client-info">
            <div className="client-avatar">{client.first_name?.[0] || 'C'}</div>
            <div>
              <p className="client-name">{client.first_name} {client.last_name}</p>
              <p className="client-email">{client.email}</p>
            </div>
          </div>

          <p className="danger-notice">
            Le client et toutes ses données associées (dossiers, documents, assignations, messages) seront supprimés définitivement.
          </p>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDelete} 
            disabled={loading}
            className="delete-btn"
          >
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default DeleteClientModal;
