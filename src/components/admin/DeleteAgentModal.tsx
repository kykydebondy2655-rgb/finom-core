import React, { useState } from 'react';
import Button from '@/components/finom/Button';
import { adminApi, Profile } from '@/services/api';
import logger from '@/lib/logger';

interface DeleteAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent: Profile;
}

const DeleteAgentModal: React.FC<DeleteAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  agent
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await adminApi.deleteAgent(agent.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      logger.logError('Error deleting agent', err);
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
          <h2 className="danger">Supprimer cet agent ?</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body centered">
          <div className="warning-icon">⚠️</div>
          <p className="warning-text">
            Cette action est irréversible.
          </p>
          
          <div className="agent-info">
            <div className="agent-avatar">{agent.first_name?.[0] || 'A'}</div>
            <div>
              <p className="agent-name">{agent.first_name} {agent.last_name}</p>
              <p className="agent-email">{agent.email}</p>
            </div>
          </div>

          <p className="danger-notice">
            L'agent et toutes ses données associées (assignations, appels, rendez-vous) seront supprimés définitivement.
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

export default DeleteAgentModal;
