import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CreateAgentModal from '@/components/admin/CreateAgentModal';
import AssignLeadsModal from '@/components/admin/AssignLeadsModal';
import DeleteAgentModal from '@/components/admin/DeleteAgentModal';
import ManageLeadsModal from '@/components/admin/ManageLeadsModal';
import { useToast } from '@/components/finom/Toast';
import { adminApi, formatDate, Profile } from '@/services/api';
import logger from '@/lib/logger';

interface AgentWithStats extends Profile {
  clientCount: number;
}

const AdminAgents: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [agents, setAgents] = useState<AgentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManageLeadsModal, setShowManageLeadsModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Profile | null>(null);
  const [availableLeadsCount, setAvailableLeadsCount] = useState(0);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const [agentData, leads] = await Promise.all([
        adminApi.getAllAgents(),
        adminApi.getNewLeads()
      ]);
      
      setAvailableLeadsCount(leads?.length || 0);
      
      // Get client counts for each agent
      const agentsWithStats: AgentWithStats[] = await Promise.all(
        (agentData || []).map(async (agent) => {
          const count = await adminApi.getAgentClientCount(agent.id);
          return { ...agent, clientCount: count };
        })
      );
      
      setAgents(agentsWithStats);
    } catch (err) {
      logger.logError('Error loading agents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (agent: Profile) => {
    setSelectedAgent(agent);
    setShowAssignModal(true);
  };

  const handleDeleteClick = (agent: Profile) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  const handleManageLeadsClick = (agent: Profile) => {
    setSelectedAgent(agent);
    setShowManageLeadsModal(true);
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-agents-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <div className="header-row">
              <div>
                <h1>Gestion des agents</h1>
                <p>{agents.length} agents actifs • {availableLeadsCount} leads disponibles</p>
              </div>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                + Créer un agent
              </Button>
            </div>
          </div>
        </div>

        <div className="container">
          <Card className="agents-card fade-in" padding="lg">
            {agents.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">Aucun agent trouvé</p>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  Créer votre premier agent
                </Button>
              </div>
            ) : (
              <div className="agents-grid">
                {agents.map(agent => (
                  <Card key={agent.id} className="agent-card" padding="lg">
                    <div className="agent-avatar">{agent.first_name?.[0] || 'A'}</div>
                    <div className="agent-info">
                      <span className="agent-name">{agent.first_name} {agent.last_name}</span>
                      <span className="agent-email">{agent.email}</span>
                      <span className="agent-stats">
                        {agent.clientCount} client{agent.clientCount !== 1 ? 's' : ''} assigné{agent.clientCount !== 1 ? 's' : ''}
                      </span>
                      <span className="agent-date">Depuis {formatDate(agent.created_at)}</span>
                    </div>
                    <div className="agent-actions">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleManageLeadsClick(agent)}
                        disabled={agent.clientCount === 0}
                      >
                        Gérer leads ({agent.clientCount})
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleAssignClick(agent)}
                        disabled={availableLeadsCount === 0}
                      >
                        Assigner des leads
                      </Button>
                      <Button variant="ghost" size="sm">Voir clients</Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="delete-agent-btn"
                        onClick={() => handleDeleteClick(agent)}
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        <CreateAgentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadAgents}
        />

        {selectedAgent && (
          <AssignLeadsModal
            isOpen={showAssignModal}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedAgent(null);
            }}
            onSuccess={() => {
              loadAgents();
            }}
            agent={selectedAgent}
            availableLeadsCount={availableLeadsCount}
          />
        )}

        {selectedAgent && (
          <ManageLeadsModal
            isOpen={showManageLeadsModal}
            onClose={() => {
              setShowManageLeadsModal(false);
              setSelectedAgent(null);
            }}
            onSuccess={loadAgents}
            agent={selectedAgent}
            allAgents={agents}
          />
        )}

        {selectedAgent && (
          <DeleteAgentModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedAgent(null);
            }}
            onSuccess={() => {
              toast.success('Agent supprimé avec succès');
              loadAgents();
            }}
            agent={selectedAgent}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default AdminAgents;
