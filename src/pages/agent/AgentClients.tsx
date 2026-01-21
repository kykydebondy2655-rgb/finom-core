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
import { normalizeClientStatus } from '@/lib/clientStatus';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

type SortField = 'name' | 'assigned_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const SORT_STORAGE_KEY = 'agent-clients-sort';
const PAGE_SIZE_STORAGE_KEY = 'agent-clients-page-size';
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const getSavedSort = (): { field: SortField; direction: SortDirection } => {
  try {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.field && parsed.direction) return parsed;
    }
  } catch {}
  return { field: 'assigned_at', direction: 'desc' };
};

const saveSort = (field: SortField, direction: SortDirection) => {
  localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify({ field, direction }));
};

const getSavedPageSize = (): number => {
  try {
    const saved = localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (PAGE_SIZE_OPTIONS.includes(parsed)) return parsed;
    }
  } catch {}
  return DEFAULT_PAGE_SIZE;
};

const savePageSize = (size: number) => {
  localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(size));
};

interface ClientAssignmentWithProfile {
  id: string;
  client_user_id: string;
  agent_user_id: string;
  assigned_at: string;
  client: Profile | null;
}

// Note: normalisation centralisée dans src/lib/clientStatus.ts

const AgentClients: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientAssignmentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(getSavedSort().field);
  const [sortDirection, setSortDirection] = useState<SortDirection>(getSavedSort().direction);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(getSavedPageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortDirection(newDirection);
    saveSort(field, newDirection);
  };

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
      const status = normalizeClientStatus(c.client?.pipeline_stage);
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [clients]);

  const filteredAndSortedClients = useMemo(() => {
    // Filter
    const filtered = clients.filter(c => {
      const client = c.client;
      if (!client) return false;
      
      // Status filter - treat null/empty as 'nouveau'
      if (statusFilter) {
        const clientStatus = normalizeClientStatus(client.pipeline_stage);
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

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name': {
          const nameA = `${a.client?.first_name || ''} ${a.client?.last_name || ''}`.toLowerCase();
          const nameB = `${b.client?.first_name || ''} ${b.client?.last_name || ''}`.toLowerCase();
          comparison = nameA.localeCompare(nameB, 'fr');
          break;
        }
        case 'assigned_at': {
          const dateA = new Date(a.assigned_at).getTime();
          const dateB = new Date(b.assigned_at).getTime();
          comparison = dateA - dateB;
          break;
        }
        case 'updated_at': {
          const dateA = new Date(a.client?.updated_at || a.assigned_at).getTime();
          const dateB = new Date(b.client?.updated_at || b.assigned_at).getTime();
          comparison = dateA - dateB;
          break;
        }
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [clients, statusFilter, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / pageSize);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedClients.slice(start, start + pageSize);
  }, [filteredAndSortedClients, currentPage, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    savePageSize(newSize);
    setCurrentPage(1);
  };

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

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4 fade-in">
            <span className="text-sm text-muted-foreground">Trier par :</span>
            {[
              { field: 'name' as SortField, label: 'Nom' },
              { field: 'assigned_at' as SortField, label: 'Date d\'assignation' },
              { field: 'updated_at' as SortField, label: 'Dernier contact' },
            ].map(opt => {
              const isActive = sortField === opt.field;
              return (
                <button
                  key={opt.field}
                  onClick={() => handleSort(opt.field)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-muted border-border text-foreground'
                  }`}
                >
                  {opt.label}
                  {isActive ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Clients Table */}
          <Card className="clients-card fade-in" padding="lg">
            {filteredAndSortedClients.length === 0 ? (
              <p className="empty-text">Aucun client trouvé</p>
            ) : (
              <>
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
                      {paginatedClients.map(assignment => (
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

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Afficher</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-1 rounded border border-border bg-card text-foreground"
                    >
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <span>par page</span>
                    <span className="ml-2">
                      ({filteredAndSortedClients.length} résultat{filteredAndSortedClients.length > 1 ? 's' : ''})
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[36px] h-9 px-3 rounded border transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card hover:bg-muted border-border text-foreground'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

      </div>
    </PageLayout>
  );
};

export default AgentClients;
