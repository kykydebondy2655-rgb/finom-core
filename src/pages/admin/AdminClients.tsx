import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { ClientImportModal } from '@/components/admin/ClientImportModal';
import DeleteClientModal from '@/components/admin/DeleteClientModal';
import { adminApi, formatDate, Profile } from '@/services/api';
import { normalizeClientStatus, CLIENT_STATUS_VALUES, ClientStatusValue } from '@/lib/clientStatus';
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS } from '@/lib/validators';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import logger from '@/lib/logger';

type SortField = 'name' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const getSavedSort = (): { field: SortField; direction: SortDirection } => {
  try {
    const saved = localStorage.getItem('admin-clients-sort');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { field: 'created_at', direction: 'desc' };
};

const saveSort = (field: SortField, direction: SortDirection) => {
  localStorage.setItem('admin-clients-sort', JSON.stringify({ field, direction }));
};

const getSavedPageSize = (): number => {
  try {
    const saved = localStorage.getItem('admin-clients-page-size');
    if (saved) return parseInt(saved, 10);
  } catch {}
  return 20;
};

const savePageSize = (size: number) => {
  localStorage.setItem('admin-clients-page-size', size.toString());
};

const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const [newLeads, setNewLeads] = useState<Profile[]>([]);
  const [assignedClients, setAssignedClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'assigned'>('new');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  
  // Status filter
  const [statusFilter, setStatusFilter] = useState<ClientStatusValue | 'all'>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>(getSavedSort().field);
  const [sortDirection, setSortDirection] = useState<SortDirection>(getSavedSort().direction);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(getSavedPageSize());

  useEffect(() => {
    loadClients();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, activeTab]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const [leads, clients] = await Promise.all([
        adminApi.getNewLeads(),
        adminApi.getAssignedClients()
      ]);
      setNewLeads(leads || []);
      setAssignedClients(clients || []);
    } catch (err) {
      logger.logError('Error loading clients', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (client: Profile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      saveSort(field, newDirection);
    } else {
      setSortField(field);
      setSortDirection('asc');
      saveSort(field, 'asc');
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    savePageSize(size);
    setCurrentPage(1);
  };

  // Get current list based on tab
  const currentList = activeTab === 'new' ? newLeads : assignedClients;

  // Status counts for filters
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: currentList.length };
    CLIENT_STATUS_VALUES.forEach(s => (counts[s] = 0));
    currentList.forEach(c => {
      const normalized = normalizeClientStatus(c.pipeline_stage);
      counts[normalized] = (counts[normalized] || 0) + 1;
    });
    return counts;
  }, [currentList]);

  // Filter, sort, and paginate
  const filteredAndSortedClients = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    // Filter by search and status
    let filtered = currentList.filter(c => {
      const matchesSearch =
        (c.first_name || '').toLowerCase().includes(searchLower) ||
        (c.last_name || '').toLowerCase().includes(searchLower) ||
        (c.email || '').toLowerCase().includes(searchLower) ||
        (c.phone || '').toLowerCase().includes(searchLower);
      
      if (statusFilter === 'all') return matchesSearch;
      const normalized = normalizeClientStatus(c.pipeline_stage);
      return matchesSearch && normalized === statusFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          const nameA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          const nameB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          cmp = nameA.localeCompare(nameB);
          break;
        case 'created_at':
          cmp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        case 'updated_at':
          cmp = new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [currentList, search, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / pageSize);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedClients.slice(start, start + pageSize);
  }, [filteredAndSortedClients, currentPage, pageSize]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="opacity-40" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout showAnimatedBackground={false}>
      <div className="admin-clients-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <div className="header-row">
              <div>
                <h1>Gestion des clients</h1>
                <p>{newLeads.length} nouveaux leads • {assignedClients.length} clients assignés</p>
              </div>
              <Button variant="primary" onClick={() => setShowImportModal(true)}>
                📁 Importer CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Tabs */}
          <div className="tabs-container fade-in">
            <button
              className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              <span className="tab-label">Nouveaux</span>
              <span className="tab-count">{newLeads.length}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'assigned' ? 'active' : ''}`}
              onClick={() => setActiveTab('assigned')}
            >
              <span className="tab-label">Clients</span>
              <span className="tab-count">{assignedClients.length}</span>
            </button>
          </div>

          {/* Status Filters */}
          <div className="status-filters fade-in" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: '1px solid var(--border)',
                background: statusFilter === 'all' ? 'var(--primary)' : 'var(--card)',
                color: statusFilter === 'all' ? 'var(--primary-foreground)' : 'var(--foreground)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Tous ({statusCounts.all})
            </button>
            {CLIENT_STATUS_VALUES.map(status => {
              const count = statusCounts[status] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={status}
                  className={`status-filter-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: `1px solid ${CLIENT_STATUS_COLORS[status] || 'var(--border)'}`,
                    background: statusFilter === status ? (CLIENT_STATUS_COLORS[status] || 'var(--primary)') : 'var(--card)',
                    color: statusFilter === status ? '#fff' : 'var(--foreground)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {CLIENT_STATUS_LABELS[status] || status} ({count})
                </button>
              );
            })}
          </div>

          {/* Search + Sort Controls */}
          <div className="toolbar fade-in" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              style={{ flex: '1', minWidth: '200px' }}
            />
            <div className="sort-controls" style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleSort('name')}
                className={`sort-btn ${sortField === 'name' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  background: sortField === 'name' ? 'var(--accent)' : 'var(--card)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Nom {getSortIcon('name')}
              </button>
              <button
                onClick={() => handleSort('created_at')}
                className={`sort-btn ${sortField === 'created_at' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  background: sortField === 'created_at' ? 'var(--accent)' : 'var(--card)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Création {getSortIcon('created_at')}
              </button>
              <button
                onClick={() => handleSort('updated_at')}
                className={`sort-btn ${sortField === 'updated_at' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  background: sortField === 'updated_at' ? 'var(--accent)' : 'var(--card)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Mise à jour {getSortIcon('updated_at')}
              </button>
            </div>
          </div>

          {/* Results info + Page size */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            <span>{filteredAndSortedClients.length} résultat(s)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Afficher</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                }}
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>par page</span>
            </div>
          </div>

          <Card className="clients-card fade-in" padding="lg">
            {paginatedClients.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">Aucun client trouvé</p>
                {activeTab === 'new' && (
                  <Button variant="primary" onClick={() => setShowImportModal(true)}>
                    Importer des leads
                  </Button>
                )}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Statut</th>
                      {activeTab === 'new' ? (
                        <>
                          <th>Prix du bien</th>
                          <th>Apport</th>
                          <th>Source</th>
                        </>
                      ) : (
                        <th>KYC</th>
                      )}
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.map(client => {
                      const status = normalizeClientStatus(client.pipeline_stage);
                      return (
                        <tr key={client.id} onClick={() => navigate(`/admin/clients/${client.id}`)}>
                          <td>
                            <div className="user-cell">
                              <div className={`user-avatar ${activeTab === 'new' ? 'new' : ''}`}>
                                {client.first_name?.[0] || 'C'}
                              </div>
                              <span>{client.first_name} {client.last_name}</span>
                            </div>
                          </td>
                          <td>{client.email || '-'}</td>
                          <td>{client.phone || '-'}</td>
                          <td>
                            <span
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                background: CLIENT_STATUS_COLORS[status] || '#6B7280',
                                color: '#fff',
                              }}
                            >
                              {CLIENT_STATUS_LABELS[status] || status}
                            </span>
                          </td>
                          {activeTab === 'new' ? (
                            <>
                              <td>{client.property_price ? `${Number(client.property_price).toLocaleString()} €` : '-'}</td>
                              <td>{client.down_payment || '-'}</td>
                              <td><span className="source-badge">{client.lead_source || '-'}</span></td>
                            </>
                          ) : (
                            <td><StatusBadge status={client.kyc_status} size="sm" /></td>
                          )}
                          <td className="date">{formatDate(client.created_at)}</td>
                          <td>
                            <div className="action-btns">
                              <Button variant="ghost" size="sm">Voir →</Button>
                              <Button variant="danger" size="sm" onClick={(e) => handleDeleteClick(client, e)}>✕</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={18} />
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
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border)',
                      background: currentPage === pageNum ? 'var(--primary)' : 'var(--card)',
                      color: currentPage === pageNum ? 'var(--primary-foreground)' : 'var(--foreground)',
                      cursor: 'pointer',
                      fontWeight: currentPage === pageNum ? 600 : 400,
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <ClientImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={loadClients}
        />

        {selectedClient && (
          <DeleteClientModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedClient(null);
            }}
            onSuccess={() => {
              loadClients();
              setShowDeleteModal(false);
              setSelectedClient(null);
            }}
            client={selectedClient}
          />
        )}

      </div>
    </PageLayout>
  );
};

export default AdminClients;