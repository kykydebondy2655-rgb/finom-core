import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { adminApi, formatDate } from '@/services/api';

const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllClients();
      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const searchLower = search.toLowerCase();
    return (
      (c.first_name || '').toLowerCase().includes(searchLower) ||
      (c.last_name || '').toLowerCase().includes(searchLower) ||
      (c.email || '').toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-clients-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <h1>Gestion des clients</h1>
            <p>{clients.length} clients enregistrés</p>
          </div>
        </div>

        <div className="container">
          <div className="toolbar fade-in">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <Card className="clients-card fade-in" padding="lg">
            {filteredClients.length === 0 ? (
              <p className="empty-text">Aucun client trouvé</p>
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
                    {filteredClients.map(client => (
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
          .admin-clients-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-admin) 0%, #5b21b6 100%); color: white; padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.25rem; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
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
          .date { color: var(--color-text-tertiary); font-size: 0.9rem; }
          .empty-text { text-align: center; color: var(--color-text-tertiary); padding: 3rem; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminClients;
