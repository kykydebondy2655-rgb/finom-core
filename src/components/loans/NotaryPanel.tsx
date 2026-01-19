import React, { useState } from 'react';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import logger from '@/lib/logger';

interface NotaryPanelProps {
  loanId: string;
  notaryRef: string | null;
  notaryIban: string | null;
  onUpdate?: (data: { notary_ref: string; notary_iban: string }) => Promise<void>;
  readOnly?: boolean;
}

const NotaryPanel: React.FC<NotaryPanelProps> = ({
  loanId,
  notaryRef,
  notaryIban,
  onUpdate,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [ref, setRef] = useState(notaryRef || '');
  const [iban, setIban] = useState(notaryIban || '');
  const [saving, setSaving] = useState(false);

  const hasData = notaryRef || notaryIban;

  const handleSave = async () => {
    if (!onUpdate) return;
    setSaving(true);
    try {
      await onUpdate({
        notary_ref: ref,
        notary_iban: iban,
      });
      setIsEditing(false);
    } catch (err) {
      logger.logError('Error updating notary info', err);
    } finally {
      setSaving(false);
    }
  };

  const formatIban = (value: string): string => {
    // Format IBAN with spaces every 4 characters
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().toUpperCase();
  };

  if (!hasData && readOnly) {
    return null;
  }

  return (
    <Card className="notary-panel" padding="lg">
      <div className="notary-header">
        <h3>⚖️ Informations notaire</h3>
        {!readOnly && !isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            {hasData ? 'Modifier' : 'Ajouter'}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <label>Référence dossier notaire</label>
            <input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Ex: 2024/12345-A"
            />
          </div>
          
          <div className="form-group">
            <label>IBAN du notaire</label>
            <input
              type="text"
              value={iban}
              onChange={(e) => setIban(formatIban(e.target.value))}
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              maxLength={34}
            />
            <span className="input-hint">L'IBAN pour le virement des fonds</span>
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
      ) : hasData ? (
        <div className="notary-info">
          {notaryRef && (
            <div className="info-row">
              <span className="info-label">Référence</span>
              <span className="info-value">{notaryRef}</span>
            </div>
          )}
          {notaryIban && (
            <div className="info-row">
              <span className="info-label">IBAN</span>
              <span className="info-value iban">{notaryIban}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>Aucune information notaire renseignée</p>
        </div>
      )}
    </Card>
  );
};

export default NotaryPanel;
