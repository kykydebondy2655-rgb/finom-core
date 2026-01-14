import React, { useState } from 'react';
import Button from '@/components/finom/Button';
import { adminApi, Profile } from '@/services/api';
import logger from '@/lib/logger';

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
      <div className="modal-content" onClick={e => e.stopPropagation()}>
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
          .modal-header h2 { margin: 0; font-size: 1.25rem; }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--color-text-secondary);
          }
          .modal-body { padding: 1.5rem; }
          .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--color-border);
            display: flex;
            justify-content: flex-end;
          }
          .agent-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--color-muted);
            border-radius: 12px;
            margin-bottom: 1.5rem;
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
          .available-leads {
            text-align: center;
            color: var(--color-text-secondary);
            margin-bottom: 1.5rem;
          }
          .options-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .option-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            background: var(--color-bg);
            border: 2px solid var(--color-border);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .option-btn:hover:not(:disabled) {
            border-color: var(--color-admin);
            background: #f3e8ff;
          }
          .option-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
          .option-count {
            font-size: 2rem;
            font-weight: 700;
            color: var(--color-admin);
          }
          .option-label {
            color: var(--color-text-secondary);
            font-size: 0.875rem;
          }
          .result-message {
            text-align: center;
            padding: 2rem;
          }
          .result-message.success { color: #16a34a; }
          .result-message.error { color: #dc2626; }
          .result-icon {
            display: block;
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .no-leads {
            text-align: center;
            padding: 2rem;
            color: var(--color-text-tertiary);
          }
        `}</style>
      </div>
    </div>
  );
};

export default AssignLeadsModal;
