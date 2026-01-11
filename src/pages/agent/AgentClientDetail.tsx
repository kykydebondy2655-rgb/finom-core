import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { agentApi, adminApi, formatCurrency, formatDate } from '@/services/api';
import { useUserRoles } from '@/hooks/useUserRoles';
import type { Profile, LoanApplication, Document } from '@/services/api';

const AgentClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState<Profile | null>(null);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'loans' | 'documents'>('info');

  // Detect if accessed from admin or agent route
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (id && user) loadClientData();
  }, [id, user, isAdmin]);

  const loadClientData = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      
      // Use admin API for admins, agent API for agents
      if (isAdmin || isAdminRoute) {
        const [clientData, loansData, docsData] = await Promise.all([
          adminApi.getClientById(id),
          adminApi.getClientLoans(id),
          adminApi.getClientDocuments(id)
        ]);
        setClient(clientData);
        setLoans(loansData || []);
        setDocuments(docsData || []);
      } else {
        // Agent: use agent-specific API that respects RLS via client_assignments
        const [clientData, loansData, docsData] = await Promise.all([
          agentApi.getClientProfile(user.id, id),
          agentApi.getClientLoans(id),
          agentApi.getClientDocuments(id)
        ]);
        setClient(clientData);
        setLoans(loansData || []);
        setDocuments(docsData || []);
      }
    } catch (err) {
      console.error('Error loading client:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic back navigation based on route
  const backPath = isAdminRoute ? '/admin/clients' : '/agent/clients';
  const themeColor = isAdminRoute ? 'var(--color-admin)' : 'var(--color-agent)';
  const themeGradient = isAdminRoute 
    ? 'linear-gradient(135deg, var(--color-admin) 0%, #5b21b6 100%)' 
    : 'linear-gradient(135deg, var(--color-agent) 0%, #047857 100%)';

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  if (!client) {
    return (
      <PageLayout>
        <div className="error-page">
          <Card padding="xl">
            <h2>Client non trouvé</h2>
            <Button variant="primary" onClick={() => navigate(backPath)}>Retour</Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="client-detail-page">
        <div className="page-header" style={{ background: themeGradient }}>
          <div className="container">
            <button className="back-btn" onClick={() => navigate(backPath)}>← Retour aux clients</button>
            <div className="header-content">
              <div className="client-header">
                <div className="client-avatar-lg">{client.first_name?.[0] || 'C'}</div>
                <div>
                  <h1>{client.first_name} {client.last_name}</h1>
                  <p>{client.email}</p>
                </div>
              </div>
              <StatusBadge status={client.kyc_status} />
            </div>
          </div>
        </div>

        <div className="container">
          {/* Quick Actions */}
          <div className="quick-actions fade-in">
            <Button variant="primary">📞 Appeler</Button>
            <Button variant="secondary">📧 Envoyer un email</Button>
            <Button variant="ghost">+ Planifier un rappel</Button>
          </div>

          {/* Tabs */}
          <div className="tabs fade-in">
            <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Informations</button>
            <button className={`tab ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>Dossiers ({loans.length})</button>
            <button className={`tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Documents ({documents.length})</button>
          </div>

          {activeTab === 'info' && (
            <Card className="info-card fade-in" padding="lg">
              <h3>Informations personnelles</h3>
              <div className="info-grid">
                <div className="info-row"><span>Nom</span><strong>{client.first_name} {client.last_name}</strong></div>
                <div className="info-row"><span>Email</span><strong>{client.email || '-'}</strong></div>
                <div className="info-row"><span>Téléphone</span><strong>{client.phone || '-'}</strong></div>
                <div className="info-row"><span>Adresse</span><strong>{client.address || '-'}</strong></div>
                <div className="info-row"><span>Statut KYC</span><StatusBadge status={client.kyc_status} size="sm" /></div>
                <div className="info-row"><span>Niveau KYC</span><strong>{client.kyc_level || 1}</strong></div>
                <div className="info-row"><span>Inscrit le</span><strong>{formatDate(client.created_at)}</strong></div>
              </div>
            </Card>
          )}

          {activeTab === 'loans' && (
            <Card className="loans-card fade-in" padding="lg">
              <h3>Dossiers de prêt</h3>
              {loans.length === 0 ? (
                <p className="empty-text">Aucun dossier</p>
              ) : (
                <div className="loans-list">
                  {loans.map(loan => (
                    <div key={loan.id} className="loan-item" onClick={() => navigate(`/loans/${loan.id}`)}>
                      <div className="loan-main">
                        <span className="loan-ref">#{loan.id.slice(0, 8)}</span>
                        <span className="loan-amount">{formatCurrency(loan.amount)}</span>
                      </div>
                      <div className="loan-meta">
                        <span>{loan.duration} ans • {loan.rate}%</span>
                        <StatusBadge status={loan.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'documents' && (
            <Card className="docs-card fade-in" padding="lg">
              <h3>Documents</h3>
              {documents.length === 0 ? (
                <p className="empty-text">Aucun document</p>
              ) : (
                <div className="docs-list">
                  {documents.map(doc => (
                    <div key={doc.id} className="doc-item">
                      <span className="doc-icon">📄</span>
                      <div className="doc-info">
                        <span className="doc-name">{doc.file_name}</span>
                        <span className="doc-meta">{doc.category} • {formatDate(doc.uploaded_at)}</span>
                      </div>
                      <StatusBadge status={doc.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        <style>{`
          .client-detail-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { color: white; padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
          .client-header { display: flex; align-items: center; gap: 1rem; }
          .client-avatar-lg { width: 64px; height: 64px; border-radius: 50%; background: white; color: ${themeColor}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; }
          .page-header h1 { color: white; font-size: 1.75rem; margin: 0; }
          .page-header p { opacity: 0.9; margin: 0.25rem 0 0; }
          .container { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }
          .quick-actions { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
          .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
          .tab { padding: 0.75rem 1.25rem; border: none; background: white; border-radius: var(--radius-full); font-weight: 600; color: var(--color-text-secondary); cursor: pointer; }
          .tab.active { background: ${themeColor}; color: white; }
          .info-grid { display: grid; gap: 1rem; }
          .info-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--color-border); }
          .info-row:last-child { border-bottom: none; }
          .info-row span:first-child { color: var(--color-text-secondary); }
          .loans-list, .docs-list { display: flex; flex-direction: column; gap: 0.75rem; }
          .loan-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: var(--radius-md); cursor: pointer; }
          .loan-item:hover { background: #f1f5f9; }
          .loan-ref { font-family: monospace; color: var(--color-text-tertiary); }
          .loan-amount { font-weight: 700; margin-left: 1rem; }
          .loan-meta { display: flex; align-items: center; gap: 1rem; font-size: 0.9rem; color: var(--color-text-secondary); }
          .doc-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: var(--radius-md); }
          .doc-icon { font-size: 1.5rem; }
          .doc-info { flex: 1; }
          .doc-name { font-weight: 600; display: block; }
          .doc-meta { font-size: 0.8rem; color: var(--color-text-tertiary); }
          .empty-text { text-align: center; color: var(--color-text-tertiary); padding: 2rem; }
          .error-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AgentClientDetail;
