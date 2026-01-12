import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import CallModal from '@/components/agent/CallModal';
import { agentApi, formatDateTime } from '@/services/api';
import type { ClientAssignment, Callback, Profile } from '@/services/api';
import { logger } from '@/lib/logger';

// Extended types for joined data
interface ClientAssignmentWithProfile extends ClientAssignment {
  client?: Profile;
}

interface CallbackWithClient extends Callback {
  client?: Profile;
}

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientAssignmentWithProfile[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedCallback, setSelectedCallback] = useState<CallbackWithClient | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [clientsData, callbacksData] = await Promise.all([
        agentApi.getAssignedClients(user.id),
        agentApi.getCallbacks(user.id)
      ]);
      setClients(clientsData || []);
      setCallbacks(callbacksData || []);
    } catch (err) {
      logger.logError('Error loading agent data', err);
    } finally {
      setLoading(false);
    }
  };

  const todayCallbacks = callbacks.filter(c => {
    const scheduled = new Date(c.scheduled_at);
    const today = new Date();
    return scheduled.toDateString() === today.toDateString() && c.status === 'planned';
  });

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="agent-dashboard">
        <div className="page-header">
          <div className="container">
            <h1>Bonjour, {user?.firstName || 'Agent'}</h1>
            <p>Espace conseiller FINOM</p>
          </div>
        </div>

        <div className="container">
          {/* Stats Cards */}
          <div className="stats-grid fade-in">
            <Card className="stat-card" padding="lg">
              <span className="stat-icon">👥</span>
              <span className="stat-value">{clients.length}</span>
              <span className="stat-label">Clients assignés</span>
            </Card>
            <Card className="stat-card" padding="lg">
              <span className="stat-icon">📞</span>
              <span className="stat-value">{todayCallbacks.length}</span>
              <span className="stat-label">Rappels aujourd'hui</span>
            </Card>
            <Card className="stat-card" padding="lg">
              <span className="stat-icon">📋</span>
              <span className="stat-value">{callbacks.filter(c => c.status === 'planned').length}</span>
              <span className="stat-label">Rappels en attente</span>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions fade-in">
            <Button variant="primary" onClick={() => navigate('/agent/clients')}>
              👥 Voir mes clients
            </Button>
            <Button variant="secondary" onClick={() => navigate('/agent/callbacks')}>
              📞 Gérer les rappels
            </Button>
          </div>

          {/* Today's Callbacks */}
          <Card className="callbacks-card fade-in" padding="lg">
            <div className="card-header">
              <h3>📞 Rappels du jour</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/agent/callbacks')}>
                Voir tout →
              </Button>
            </div>

            {todayCallbacks.length === 0 ? (
              <p className="empty-text">Aucun rappel prévu aujourd'hui</p>
            ) : (
              <div className="callbacks-list">
                {todayCallbacks.slice(0, 5).map(callback => (
                  <div key={callback.id} className="callback-item">
                    <div className="callback-info">
                      <span className="callback-client">
                        {callback.client?.first_name} {callback.client?.last_name}
                      </span>
                      <span className="callback-time">{formatDateTime(callback.scheduled_at)}</span>
                      {callback.reason && <span className="callback-reason">{callback.reason}</span>}
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => {
                        setSelectedCallback(callback);
                        setShowCallModal(true);
                      }}
                    >
                      📞 Appeler
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Clients */}
          <Card className="clients-card fade-in" padding="lg">
            <div className="card-header">
              <h3>👥 Derniers clients</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/agent/clients')}>
                Voir tout →
              </Button>
            </div>

            {clients.length === 0 ? (
              <p className="empty-text">Aucun client assigné</p>
            ) : (
              <div className="clients-list">
                {clients.slice(0, 5).map(assignment => (
                  <div 
                    key={assignment.id} 
                    className="client-item"
                    onClick={() => navigate(`/agent/clients/${assignment.client_user_id}`)}
                  >
                    <div className="client-avatar">
                      {assignment.client?.first_name?.[0] || 'C'}
                    </div>
                    <div className="client-info">
                      <span className="client-name">
                        {assignment.client?.first_name} {assignment.client?.last_name}
                      </span>
                      <span className="client-email">{assignment.client?.email}</span>
                    </div>
                    <StatusBadge status={assignment.client?.kyc_status || 'pending'} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Call Modal */}
        <CallModal
          isOpen={showCallModal}
          onClose={() => {
            setShowCallModal(false);
            setSelectedCallback(null);
          }}
          onSuccess={loadData}
          callback={selectedCallback}
        />

        <style>{`
          .agent-dashboard { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-agent) 0%, #047857 100%); color: white; padding: 3rem 1.5rem; margin-bottom: 2rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
          .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
          .stat-card { text-align: center; }
          .stat-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
          .stat-value { font-size: 2.5rem; font-weight: 700; color: var(--color-agent); display: block; }
          .stat-label { font-size: 0.9rem; color: var(--color-text-secondary); }
          .quick-actions { display: flex; gap: 1rem; margin-bottom: 2rem; }
          .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
          .card-header h3 { margin: 0; }
          .callbacks-card, .clients-card { margin-bottom: 1.5rem; }
          .empty-text { color: var(--color-text-tertiary); text-align: center; padding: 2rem; }
          .callbacks-list, .clients-list { display: flex; flex-direction: column; gap: 0.75rem; }
          .callback-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: var(--radius-md); }
          .callback-client { font-weight: 600; display: block; }
          .callback-time { font-size: 0.85rem; color: var(--color-text-secondary); }
          .callback-reason { font-size: 0.8rem; color: var(--color-text-tertiary); display: block; }
          .client-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: var(--radius-md); cursor: pointer; transition: background 0.2s; }
          .client-item:hover { background: #f1f5f9; }
          .client-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-agent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
          .client-info { flex: 1; }
          .client-name { font-weight: 600; display: block; }
          .client-email { font-size: 0.85rem; color: var(--color-text-tertiary); }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr; } .quick-actions { flex-direction: column; } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AgentDashboard;
