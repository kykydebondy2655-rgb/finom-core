import React, { useState } from 'react';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import { formatCurrency } from '@/services/api';
import logger from '@/lib/logger';

interface SequestrePanelProps {
  loanId: string;
  sequestreStatus: string;
  amountExpected: number | null;
  amountReceived: number | null;
  onUpdate?: (data: { 
    sequestre_status: string; 
    sequestre_amount_expected: number; 
    sequestre_amount_received: number;
  }) => Promise<void>;
  readOnly?: boolean;
}

const SEQUESTRE_STATUSES = [
  { value: 'none', label: 'Non requis', color: '#9ca3af', icon: '⚪' },
  { value: 'pending', label: 'En attente', color: '#f59e0b', icon: '⏳' },
  { value: 'partial', label: 'Partiel', color: '#3b82f6', icon: '🔵' },
  { value: 'received', label: 'Reçu', color: '#10b981', icon: '✅' },
  { value: 'released', label: 'Libéré', color: '#8b5cf6', icon: '💸' },
];

const SequestrePanel: React.FC<SequestrePanelProps> = ({
  loanId,
  sequestreStatus,
  amountExpected,
  amountReceived,
  onUpdate,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(sequestreStatus || 'none');
  const [expected, setExpected] = useState(amountExpected || 0);
  const [received, setReceived] = useState(amountReceived || 0);
  const [saving, setSaving] = useState(false);

  const currentStatus = SEQUESTRE_STATUSES.find(s => s.value === sequestreStatus) || SEQUESTRE_STATUSES[0];
  const progressPercentage = expected > 0 ? Math.min(100, Math.round((received / expected) * 100)) : 0;

  const handleSave = async () => {
    if (!onUpdate) return;
    setSaving(true);
    try {
      await onUpdate({
        sequestre_status: status,
        sequestre_amount_expected: expected,
        sequestre_amount_received: received,
      });
      setIsEditing(false);
    } catch (err) {
      logger.logError('Error updating sequestre', err);
    } finally {
      setSaving(false);
    }
  };

  if (sequestreStatus === 'none' && readOnly) {
    return null;
  }

  return (
    <Card className="sequestre-panel" padding="lg">
      <div className="sequestre-header">
        <h3>🏛️ Séquestre / Acompte</h3>
        {!readOnly && !isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <label>Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {SEQUESTRE_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Montant attendu (€)</label>
              <input
                type="number"
                value={expected}
                onChange={(e) => setExpected(Number(e.target.value))}
                min={0}
                step={100}
              />
            </div>
            <div className="form-group">
              <label>Montant reçu (€)</label>
              <input
                type="number"
                value={received}
                onChange={(e) => setReceived(Number(e.target.value))}
                min={0}
                step={100}
              />
            </div>
          </div>

          <div className="form-actions">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="sequestre-info">
          <div className="status-row">
            <span className="status-badge" style={{ '--status-color': currentStatus.color } as React.CSSProperties}>
              {currentStatus.icon} {currentStatus.label}
            </span>
          </div>

          {sequestreStatus !== 'none' && (
            <>
              <div className="amounts-row">
                <div className="amount-item">
                  <span className="amount-label">Attendu</span>
                  <span className="amount-value">{formatCurrency(expected)}</span>
                </div>
                <div className="amount-item">
                  <span className="amount-label">Reçu</span>
                  <span className="amount-value received">{formatCurrency(received)}</span>
                </div>
              </div>

              {expected > 0 && (
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="progress-text">{progressPercentage}%</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default SequestrePanel;
