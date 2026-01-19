import React, { useState } from 'react';
import Button from '@/components/finom/Button';
import { adminApi, Profile } from '@/services/api';
import logger from '@/lib/logger';
import '@/styles/components.css';

interface AssignLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent: Profile;
  availableLeadsCount: number;
}

const ASSIGNMENT_OPTIONS = [1, 2, 5, 10, 15, 20];

const AssignLeadsModal: React.FC<AssignLeadsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  agent,
  availableLeadsCount
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number } | null>(null);

  const handleAssign = async (count: number) => {
    setLoading(true);
    try {
      const assignedCount = await adminApi.assignLeadsToAgent(agent.id, count);
      setResult({ success: true, count: assignedCount });
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      logger.logError('Error assigning leads', err);
      setResult({ success: false, count: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content assign-leads-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assigner des leads</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {result ? (
            <div className={`result-message ${result.success ? 'success' : 'error'}`}>
              {result.success ? (
                <>
                  <span className="result-icon">✓</span>
                  <p>{result.count} lead{result.count > 1 ? 's' : ''} assigné{result.count > 1 ? 's' : ''} à {agent.first_name} {agent.last_name}</p>
                </>
              ) : (
                <>
                  <span className="result-icon">✕</span>
                  <p>Erreur lors de l'assignation</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="agent-info">
                <div className="agent-avatar">{agent.first_name?.[0] || 'A'}</div>
                <div>
                  <p className="agent-name">{agent.first_name} {agent.last_name}</p>
                  <p className="agent-email">{agent.email}</p>
                </div>
              </div>

              <p className="available-leads">
                {availableLeadsCount} lead{availableLeadsCount > 1 ? 's' : ''} disponible{availableLeadsCount > 1 ? 's' : ''}
              </p>

              {availableLeadsCount === 0 ? (
                <div className="no-leads">
                  <p>Aucun nouveau lead disponible</p>
                </div>
              ) : (
                <div className="options-grid">
                  {ASSIGNMENT_OPTIONS.map(count => (
                    <button
                      key={count}
                      className="option-btn"
                      onClick={() => handleAssign(count)}
                      disabled={loading || count > availableLeadsCount}
                    >
                      <span className="option-count">{count}</span>
                      <span className="option-label">leads</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadsModal;
