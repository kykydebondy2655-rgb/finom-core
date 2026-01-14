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

        <style>{`
          .admin-agents-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-admin) 0%, #5b21b6 100%); color: white; padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.25rem; }
          .container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
          .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
          .agent-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .agent-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--color-agent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 1rem; }
          .agent-info { margin-bottom: 1rem; }
          .agent-name { font-weight: 700; font-size: 1.1rem; display: block; margin-bottom: 0.25rem; }
          .agent-email { color: var(--color-text-secondary); font-size: 0.9rem; display: block; }
          .agent-stats { 
            display: inline-block; 
            margin-top: 0.5rem;
            padding: 0.25rem 0.75rem;
            background: #dcfce7;
            color: #16a34a;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
          }
          .agent-date { color: var(--color-text-tertiary); font-size: 0.8rem; display: block; margin-top: 0.5rem; }
          .agent-actions { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }
          .empty-state { text-align: center; padding: 3rem; }
          .empty-text { color: var(--color-text-tertiary); margin-bottom: 1.5rem; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .delete-agent-btn { color: #dc2626 !important; }
          .delete-agent-btn:hover { background: #fef2f2 !important; }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminAgents;
