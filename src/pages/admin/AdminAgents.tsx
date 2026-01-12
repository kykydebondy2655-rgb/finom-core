import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CreateAgentModal from '@/components/admin/CreateAgentModal';
import { adminApi, formatDate } from '@/services/api';
import logger from '@/lib/logger';

const AdminAgents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllAgents();
      setAgents(data || []);
    } catch (err) {
      logger.logError('Error loading agents', err);
    } finally {
      setLoading(false);
    }
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
                <p>{agents.length} agents actifs</p>
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
                      <span className="agent-date">Depuis {formatDate(agent.created_at)}</span>
                    </div>
                    <div className="agent-actions">
                      <Button variant="ghost" size="sm">Voir clients</Button>
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
          .agent-date { color: var(--color-text-tertiary); font-size: 0.8rem; display: block; margin-top: 0.5rem; }
          .empty-state { text-align: center; padding: 3rem; }
          .empty-text { color: var(--color-text-tertiary); margin-bottom: 1.5rem; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminAgents;
