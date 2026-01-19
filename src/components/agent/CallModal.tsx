import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/finom/Button';
import { agentApi } from '@/services/api';
import logger from '@/lib/logger';
import '@/styles/components.css';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  callback: {
    id: string;
    client_id: string;
    client?: {
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
  } | null;
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  callback
}) => {
  const { user } = useAuth();
  const [callStatus, setCallStatus] = useState<'answered' | 'no_answer' | 'busy' | 'voicemail'>('answered');
  const [callType, setCallType] = useState<'outbound' | 'inbound'>('outbound');
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');
  const [markAsCompleted, setMarkAsCompleted] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Timer for call duration
  const [timerRunning, setTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, startTime]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setCallStatus('answered');
      setCallType('outbound');
      setDuration(0);
      setNotes('');
      setMarkAsCompleted(true);
      setRescheduleDate('');
      setRescheduleTime('');
      setTimerRunning(false);
      setStartTime(null);
    }
  }, [isOpen]);

  const startTimer = () => {
    setStartTime(Date.now());
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !callback) return;

    try {
      setLoading(true);

      // Log the call
      await agentApi.logCall({
        agent_id: user.id,
        client_id: callback.client_id,
        call_type: callType,
        call_status: callStatus,
        duration_seconds: duration,
        notes: notes || null
      });

      // Update the callback
      if (markAsCompleted) {
        await agentApi.updateCallback(callback.id, {
          status: 'done',
          completed_at: new Date().toISOString(),
          notes: notes || null
        });
      } else if (rescheduleDate && rescheduleTime) {
        // Reschedule
        const newScheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
        await agentApi.updateCallback(callback.id, {
          scheduled_at: newScheduledAt,
          notes: notes || null
        });
      } else {
        // Just update notes
        if (notes) {
          await agentApi.updateCallback(callback.id, { notes });
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      logger.logError('Error logging call', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !callback) return null;

  const clientName = `${callback.client?.first_name || ''} ${callback.client?.last_name || ''}`.trim() || 'Client';
  const clientPhone = callback.client?.phone || 'Non renseigné';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content call-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📞 Appel en cours</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="call-info">
          <div className="client-avatar">{callback.client?.first_name?.[0] || 'C'}</div>
          <div className="client-details">
            <span className="client-name">{clientName}</span>
            <span className="client-phone">{clientPhone}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="timer-section">
          <div className="timer-display">{formatDuration(duration)}</div>
          <div className="timer-controls">
            {!timerRunning ? (
              <Button variant="primary" size="sm" onClick={startTimer}>
                ▶️ Démarrer
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={stopTimer}>
                ⏸️ Arrêter
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Type d'appel</label>
              <select value={callType} onChange={(e) => setCallType(e.target.value as any)}>
                <option value="outbound">Sortant</option>
                <option value="inbound">Entrant</option>
              </select>
            </div>
            <div className="form-group">
              <label>Résultat</label>
              <select value={callStatus} onChange={(e) => setCallStatus(e.target.value as any)}>
                <option value="answered">Répondu</option>
                <option value="no_answer">Pas de réponse</option>
                <option value="busy">Occupé</option>
                <option value="voicemail">Messagerie</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes de l'appel</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Résumé de la conversation, points importants..."
              rows={3}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={markAsCompleted}
                onChange={(e) => setMarkAsCompleted(e.target.checked)}
              />
              Marquer le rappel comme terminé
            </label>
          </div>

          {!markAsCompleted && (
            <div className="reschedule-section">
              <p className="reschedule-label">Reprogrammer le rappel :</p>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer l\'appel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CallModal;
