import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import CallModal from '@/components/agent/CallModal';
import ClientStatusStats from '@/components/agent/ClientStatusStats';
import RecentActivityWidget from '@/components/agent/RecentActivityWidget';
import { agentApi, formatDateTime } from '@/services/api';
import type { ClientAssignment, Callback, Profile } from '@/services/api';
import { logger } from '@/lib/logger';
import { Users, Phone, ClipboardList, Calendar, BarChart3 } from 'lucide-react';

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

  // Extract assigned client IDs for activity widget
  const assignedClientIds = useMemo(() => 
    clients.map(c => c.client_user_id), 
    [clients]
  );

  if (loading) {
    return <PageLayout showAnimatedBackground={false}><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout showAnimatedBackground={false}>
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
              <span className="stat-icon"><Users size={24} /></span>
              <span className="stat-value">{clients.length}</span>
              <span className="stat-label">Clients assignés</span>
            </Card>
            <Card className="stat-card" padding="lg">
              <span className="stat-icon"><Phone size={24} /></span>
              <span className="stat-value">{todayCallbacks.length}</span>
              <span className="stat-label">Rappels aujourd'hui</span>
            </Card>
            <Card className="stat-card" padding="lg">
              <span className="stat-icon"><Calendar size={24} /></span>
              <span className="stat-value">{callbacks.filter(c => c.status === 'planned').length}</span>
              <span className="stat-label">Rappels en attente</span>
            </Card>
          </div>

          {/* Status Statistics */}
          <Card className="stats-panel-card fade-in" padding="lg">
            <div className="card-header">
              <h3><BarChart3 size={20} className="inline-icon" />Statistiques clients</h3>
            </div>
            <ClientStatusStats clients={clients} />
          </Card>

          {/* Quick Actions */}
          <div className="quick-actions fade-in">
            <Button variant="primary" onClick={() => navigate('/agent/clients')}>
              <Users size={18} className="btn-icon-text" />
              Voir mes clients
            </Button>
            <Button variant="secondary" onClick={() => navigate('/agent/callbacks')}>
              <Phone size={18} className="btn-icon-text" />
              Gérer les rappels
            </Button>
          </div>

          {/* Recent Activity Widget */}
          {user && (
            <RecentActivityWidget 
              agentId={user.id} 
              assignedClientIds={assignedClientIds} 
              maxItems={8}
            />
          )}

          {/* Today's Callbacks */}
          <Card className="callbacks-card fade-in" padding="lg">
            <div className="card-header">
              <h3><Phone size={20} className="inline-icon" />Rappels du jour</h3>
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
              <h3><Users size={20} className="inline-icon" />Derniers clients</h3>
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

      </div>
    </PageLayout>
  );
};

export default AgentDashboard;
