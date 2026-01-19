import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { ClientImportModal } from '@/components/admin/ClientImportModal';
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

      </div>
    </PageLayout>
  );
};

export default AdminClients;
