import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ClientStatusSelect, { CLIENT_STATUSES } from '@/components/agent/ClientStatusSelect';
import { Badge } from '@/components/ui/badge';
import { agentApi, formatDate, Profile } from '@/services/api';
import logger from '@/lib/logger';

interface ClientAssignmentWithProfile {
  id: string;
  client_user_id: string;
  agent_user_id: string;
  assigned_at: string;
  client: Profile | null;
}

const normalizeStatus = (raw: string | null | undefined): string => {
  if (!raw) return 'nouveau';
  const v = raw.trim();
  if (!v) return 'nouveau';

  const lower = v.toLowerCase();
  const normalized = lower
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  if (normalized === 'faux_numéro' || normalized === 'faux_numero') return 'faux_numero';
  if (normalized === 'à_rappeler' || normalized === 'a_rappeler') return 'a_rappeler';
  if (normalized === 'pas_intéressé' || normalized === 'pas_interessé') return 'pas_interesse';
  if (normalized === 'nrp') return 'nrp';
  if (normalized === 'nouveau' || normalized === 'nouveaux') return 'nouveau';

  return normalized;
};

const AgentClients: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientAssignmentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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

  // Count clients per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: clients.length };
    clients.forEach(c => {
      const status = normalizeStatus(c.client?.pipeline_stage);
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [clients]);

  const filteredClients = clients.filter(c => {
    const client = c.client;
    if (!client) return false;
    
    // Status filter - treat null/empty as 'nouveau'
    if (statusFilter) {
      const clientStatus = normalizeStatus(client.pipeline_stage);
      if (clientStatus !== statusFilter) return false;
    }
    
    // Search filter
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

          {/* Status Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4 fade-in">
            <button
              onClick={() => setStatusFilter(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all ${
                statusFilter === null
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card hover:bg-muted border-border text-foreground'
              }`}
            >
              Tous
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {statusCounts.all || 0}
              </Badge>
            </button>
            {CLIENT_STATUSES.map(status => {
              const count = statusCounts[status.value] || 0;
              const isActive = statusFilter === status.value;
              return (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(isActive ? null : status.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all ${
                    isActive
                      ? 'text-white border-transparent'
                      : 'bg-card hover:bg-muted border-border text-foreground'
                  }`}
                  style={isActive ? { backgroundColor: status.color } : undefined}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  {status.label}
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-1.5 py-0 ${isActive ? 'bg-white/20 text-white' : ''}`}
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
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
