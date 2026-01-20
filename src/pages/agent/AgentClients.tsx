import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ClientStatusSelect from '@/components/agent/ClientStatusSelect';
import { agentApi, formatDate, Profile } from '@/services/api';
import logger from '@/lib/logger';

interface ClientAssignmentWithProfile {
  id: string;
  client_user_id: string;
  agent_user_id: string;
  assigned_at: string;
  client: Profile | null;
}

const AgentClients: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientAssignmentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) loadClients();
  }, [user]);

  const loadClients = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await agentApi.getAssignedClients(user.id);
      setClients(data || []);
    } catch (err) {
      logger.logError('Error loading clients', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const client = c.client;
    if (!client) return false;
    const searchLower = search.toLowerCase();
    return (
      (client.first_name || '').toLowerCase().includes(searchLower) ||
      (client.last_name || '').toLowerCase().includes(searchLower) ||
      (client.email || '').toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout showAnimatedBackground={false}>
      <div className="agent-clients-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/agent/dashboard')}>← Retour</button>
            <h1>Mes clients</h1>
            <p>{clients.length} clients assignés</p>
          </div>
        </div>

        <div className="container">
          {/* Search */}
          <div className="search-bar fade-in">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Clients Table */}
          <Card className="clients-card fade-in" padding="lg">
            {filteredClients.length === 0 ? (
              <p className="empty-text">Aucun client trouvé</p>
            ) : (
              <div className="table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Statut</th>
                      <th>Assigné le</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(assignment => (
                      <tr key={assignment.id}>
                        <td onClick={() => navigate(`/agent/clients/${assignment.client_user_id}`)}>
                          <div className="client-cell">
                            <div className="client-avatar">{assignment.client?.first_name?.[0] || 'C'}</div>
                            <span>{assignment.client?.first_name} {assignment.client?.last_name}</span>
                          </div>
                        </td>
                        <td onClick={() => navigate(`/agent/clients/${assignment.client_user_id}`)}>{assignment.client?.email || '-'}</td>
                        <td onClick={() => navigate(`/agent/clients/${assignment.client_user_id}`)}>{assignment.client?.phone || '-'}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <ClientStatusSelect 
                            clientId={assignment.client_user_id}
                            currentStatus={assignment.client?.pipeline_stage}
                            size="sm"
                            onStatusChange={() => loadClients()}
                          />
                        </td>
                        <td className="date" onClick={() => navigate(`/agent/clients/${assignment.client_user_id}`)}>{formatDate(assignment.assigned_at)}</td>
                        <td><Button variant="ghost" size="sm" onClick={() => navigate(`/agent/clients/${assignment.client_user_id}`)}>Voir →</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

      </div>
    </PageLayout>
  );
};

export default AgentClients;
