import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/finom/Button';
import { agentApi } from '@/services/api';

interface CreateCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedClientId?: string;
}

interface ClientOption {
  id: string;
  name: string;
}

const CreateCallbackModal: React.FC<CreateCallbackModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedClientId
}) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState(preselectedClientId || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadClients();
      // Set default date/time to tomorrow at 10:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
      setScheduledTime('10:00');
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (preselectedClientId) {
      setSelectedClient(preselectedClientId);
    }
  }, [preselectedClientId]);

  const loadClients = async () => {
    if (!user) return;
    try {
      setLoadingClients(true);
      const data = await agentApi.getAssignedClients(user.id);
      setClients(
        (data || []).map((a: any) => ({
          id: a.client_user_id,
          name: `${a.client?.first_name || ''} ${a.client?.last_name || ''}`.trim() || 'Client'
        }))
      );
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClient || !scheduledDate || !scheduledTime) return;

    try {
      setLoading(true);
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      
      await agentApi.createCallback({
        agent_id: user.id,
        client_id: selectedClient,
        scheduled_at: scheduledAt,
        reason: reason || null,
        status: 'planned'
      });
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error creating callback:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClient(preselectedClientId || '');
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📞 Planifier un rappel</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Client *</label>
            {loadingClients ? (
              <p className="loading-text">Chargement...</p>
            ) : (
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                required
                disabled={!!preselectedClientId}
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Heure *</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Motif du rappel</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Suivi dossier de prêt, Relance documents..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || !selectedClient || !scheduledDate || !scheduledTime}
            >
              {loading ? 'Création...' : 'Planifier le rappel'}
            </Button>
          </div>
        </form>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }
          .modal-content {
            background: white;
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 480px;
            max-height: 90vh;
            overflow-y: auto;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid var(--color-border);
          }
          .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
          }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--color-text-tertiary);
          }
          form {
            padding: 1.5rem;
          }
          .form-group {
            margin-bottom: 1.25rem;
          }
          .form-group label {
            display: block;
            font-weight: 500;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          .form-group input,
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-size: 1rem;
          }
          .form-group textarea {
            resize: vertical;
          }
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding-top: 1rem;
            border-top: 1px solid var(--color-border);
          }
          .loading-text {
            color: var(--color-text-tertiary);
            font-style: italic;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CreateCallbackModal;
