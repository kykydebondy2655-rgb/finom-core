import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import ClientImportModal from '@/components/admin/ClientImportModal';
import DeleteClientModal from '@/components/admin/DeleteClientModal';
import { adminApi, formatDate, Profile } from '@/services/api';
import logger from '@/lib/logger';

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

  useEffect(() => {
    loadClients();
  }, []);

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

  const filterClients = (clients: Profile[]) => {
    const searchLower = search.toLowerCase();
    return clients.filter(c =>
      (c.first_name || '').toLowerCase().includes(searchLower) ||
      (c.last_name || '').toLowerCase().includes(searchLower) ||
      (c.email || '').toLowerCase().includes(searchLower)
    );
  };

  const filteredNewLeads = filterClients(newLeads);
  const filteredAssignedClients = filterClients(assignedClients);

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
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

          <div className="toolbar fade-in">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <Card className="clients-card fade-in" padding="lg">
            {activeTab === 'new' ? (
              filteredNewLeads.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-text">Aucun nouveau lead</p>
                  <Button variant="primary" onClick={() => setShowImportModal(true)}>
                    Importer des leads
                  </Button>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Lead</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Prix du bien</th>
                        <th>Apport</th>
                        <th>Source</th>
                        <th>Pipeline</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNewLeads.map(lead => (
                        <tr key={lead.id} onClick={() => navigate(`/admin/clients/${lead.id}`)}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar new">{lead.first_name?.[0] || 'L'}</div>
                              <span>{lead.first_name} {lead.last_name}</span>
                            </div>
                          </td>
                          <td>{lead.email || '-'}</td>
                          <td>{lead.phone || '-'}</td>
                          <td>{lead.property_price ? `${Number(lead.property_price).toLocaleString()} €` : '-'}</td>
                          <td>{lead.down_payment || '-'}</td>
                          <td><span className="source-badge">{lead.lead_source || '-'}</span></td>
                          <td><span className="pipeline-badge">{lead.pipeline_stage || '-'}</span></td>
                          <td>
                            <div className="action-btns">
                              <Button variant="ghost" size="sm">Voir →</Button>
                              <Button variant="danger" size="sm" onClick={(e) => handleDeleteClick(lead, e)}>✕</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              filteredAssignedClients.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-text">Aucun client assigné</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>KYC</th>
                        <th>Inscrit le</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignedClients.map(client => (
                        <tr key={client.id} onClick={() => navigate(`/admin/clients/${client.id}`)}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{client.first_name?.[0] || 'C'}</div>
                              <span>{client.first_name} {client.last_name}</span>
                            </div>
                          </td>
                          <td>{client.email || '-'}</td>
                          <td>{client.phone || '-'}</td>
                          <td><StatusBadge status={client.kyc_status} size="sm" /></td>
                          <td className="date">{formatDate(client.created_at)}</td>
                          <td>
                            <div className="action-btns">
                              <Button variant="ghost" size="sm">Voir →</Button>
                              <Button variant="danger" size="sm" onClick={(e) => handleDeleteClick(client, e)}>✕</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </Card>
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

        <style>{`
          .admin-clients-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-admin) 0%, #5b21b6 100%); color: white; padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.25rem; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
          
          .tabs-container {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            background: var(--color-muted);
            padding: 0.25rem;
            border-radius: 10px;
            width: fit-content;
          }
          .tab-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: transparent;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            color: var(--color-text-secondary);
            transition: all 0.2s;
          }
          .tab-btn.active {
            background: white;
            color: var(--color-text);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .tab-count {
            background: var(--color-border);
            padding: 0.125rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
          }
          .tab-btn.active .tab-count {
            background: var(--color-admin);
            color: white;
          }
          
          .toolbar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
          .search-input { max-width: 400px; }
          .table-wrapper { overflow-x: auto; }
          .data-table { width: 100%; border-collapse: collapse; }
          .data-table th { text-align: left; padding: 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border); }
          .data-table td { padding: 1rem; border-bottom: 1px solid var(--color-border); }
          .data-table tbody tr { cursor: pointer; transition: background 0.15s; }
          .data-table tbody tr:hover { background: #f8fafc; }
          .user-cell { display: flex; align-items: center; gap: 0.75rem; }
          .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--color-admin); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; }
          .user-avatar.new { background: #f59e0b; }
          .date { color: var(--color-text-tertiary); font-size: 0.9rem; }
          .source-badge, .pipeline-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            background: var(--color-muted);
          }
          .action-btns {
            display: flex;
            gap: 0.5rem;
          }
          .empty-state { text-align: center; padding: 3rem; }
          .empty-text { color: var(--color-text-tertiary); margin-bottom: 1.5rem; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminClients;
