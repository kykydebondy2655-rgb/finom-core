import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { agentApi, formatDate } from '@/services/api';
import logger from '@/lib/logger';

const AgentClients: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
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
    <PageLayout>
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
                      <th>KYC</th>
                      <th>Assigné le</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(assignment => (
                      <tr key={assignment.id} onClick={() => navigate(`/agent/clients/${assignment.client_user_id}`)}>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar">{assignment.client?.first_name?.[0] || 'C'}</div>
                            <span>{assignment.client?.first_name} {assignment.client?.last_name}</span>
                          </div>
                        </td>
                        <td>{assignment.client?.email || '-'}</td>
                        <td>{assignment.client?.phone || '-'}</td>
                        <td><StatusBadge status={assignment.client?.kyc_status} size="sm" /></td>
                        <td className="date">{formatDate(assignment.assigned_at)}</td>
                        <td><Button variant="ghost" size="sm">Voir →</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <style>{`
          .agent-clients-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-agent) 0%, #047857 100%); color: white; padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.25rem; }
          .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
          .search-bar { margin-bottom: 1.5rem; }
          .search-bar input { max-width: 400px; }
          .table-wrapper { overflow-x: auto; }
          .clients-table { width: 100%; border-collapse: collapse; }
          .clients-table th { text-align: left; padding: 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border); }
          .clients-table td { padding: 1rem; border-bottom: 1px solid var(--color-border); }
          .clients-table tr { cursor: pointer; transition: background 0.15s; }
          .clients-table tbody tr:hover { background: #f8fafc; }
          .client-cell { display: flex; align-items: center; gap: 0.75rem; }
          .client-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--color-agent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; }
          .date { color: var(--color-text-tertiary); font-size: 0.9rem; }
          .empty-text { text-align: center; color: var(--color-text-tertiary); padding: 3rem; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AgentClients;
