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
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Supprimer cet agent ?</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
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

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modal-content {
            background: var(--color-bg);
            border-radius: 16px;
            width: 90%;
            max-width: 420px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid var(--color-border);
          }
          .modal-header h2 { margin: 0; font-size: 1.25rem; color: #dc2626; }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--color-text-secondary);
          }
          .modal-body { padding: 1.5rem; text-align: center; }
          .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--color-border);
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
          }
          .warning-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .warning-text {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }
          .agent-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--color-muted);
            border-radius: 12px;
            margin-bottom: 1rem;
            text-align: left;
          }
          .agent-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--color-agent);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.25rem;
          }
          .agent-name { font-weight: 600; margin: 0; }
          .agent-email { color: var(--color-text-secondary); font-size: 0.875rem; margin: 0; }
          .danger-notice {
            color: #dc2626;
            font-size: 0.875rem;
            padding: 0.75rem;
            background: #fef2f2;
            border-radius: 8px;
          }
          .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 1rem;
            font-size: 0.875rem;
          }
          .delete-btn {
            background: #dc2626 !important;
          }
          .delete-btn:hover {
            background: #b91c1c !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DeleteAgentModal;
