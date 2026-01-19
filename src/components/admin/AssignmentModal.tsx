import React, { useState, useEffect } from 'react';
import Button from '@/components/finom/Button';
import { adminApi } from '@/services/api';
import { notifyAgentAssignment } from '@/hooks/useAgentAssignmentNotification';
import logger from '@/lib/logger';
import '@/styles/components.css';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingAssignments: Array<{ client_user_id: string; agent_user_id: string }>;
}

interface SelectOption {
  id: string;
  label: string;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingAssignments
}) => {
  const [agents, setAgents] = useState<SelectOption[]>([]);
  const [clients, setClients] = useState<SelectOption[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [agentsData, clientsData] = await Promise.all([
        adminApi.getAllAgents(),
        adminApi.getAllClients()
      ]);
      
      setAgents(
        (agentsData || []).map((a: any) => ({
          id: a.id,
          label: `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.email || 'Agent'
        }))
      );
      
      // Filter out clients that are already assigned
      const assignedClientIds = existingAssignments.map(a => a.client_user_id);
      setClients(
        (clientsData || [])
          .filter((c: any) => !assignedClientIds.includes(c.id))
          .map((c: any) => ({
            id: c.id,
            label: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || 'Client'
          }))
      );
    } catch (err) {
      logger.logError('Error loading assignment data', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !selectedClient) return;

    try {
      setLoading(true);
      setError(null);
      await adminApi.createAssignment(selectedAgent, selectedClient);
      
      // Notify the agent of the new assignment
      const client = clients.find(c => c.id === selectedClient);
      if (client) {
        notifyAgentAssignment({
          agentId: selectedAgent,
          clientId: selectedClient,
          clientName: client.label,
        }).catch(err => logger.logError('Agent notification error', err));
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      logger.logError('Error creating assignment', err);
      setError(err?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAgent('');
    setSelectedClient('');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assignment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Nouvelle assignation</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {loadingData ? (
          <div className="loading-state">Chargement...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Agent *</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                required
              >
                <option value="">Sélectionner un agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Client *</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.label}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <span className="input-hint">Tous les clients sont déjà assignés</span>
              )}
            </div>

            <div className="modal-actions">
              <Button variant="ghost" type="button" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading || !selectedAgent || !selectedClient}
              >
                {loading ? 'Création...' : 'Créer l\'assignation'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignmentModal;
