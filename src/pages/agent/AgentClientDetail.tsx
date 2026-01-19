import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { agentApi, adminApi, formatCurrency, formatDate } from '@/services/api';
import { useUserRoles } from '@/hooks/useUserRoles';
import CreateCallbackModal from '@/components/agent/CreateCallbackModal';
import DocumentStatusModal from '@/components/agent/DocumentStatusModal';
import LoanStatusModal from '@/components/agent/LoanStatusModal';
import ClientBankModal from '@/components/admin/ClientBankModal';
import AdminDocumentUploadModal from '@/components/admin/AdminDocumentUploadModal';
import DeleteClientModal from '@/components/admin/DeleteClientModal';
import SendAccountEmailModal from '@/components/agent/SendAccountEmailModal';
import ClientStatusSelect from '@/components/agent/ClientStatusSelect';
import ClientStatusHistory from '@/components/agent/ClientStatusHistory';
import { useToast } from '@/components/finom/Toast';
import { storageService } from '@/services/storageService';
import type { Profile, LoanApplication, Document, BankAccount } from '@/services/api';

const AgentClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState<Profile | null>(null);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'loans' | 'documents'>('info');
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [showDocumentStatusModal, setShowDocumentStatusModal] = useState(false);
  const [showLoanStatusModal, setShowLoanStatusModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showAdminUploadModal, setShowAdminUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAccountEmailModal, setShowAccountEmailModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const toast = useToast();

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
        const [clientData, loansData, docsData, bankData] = await Promise.all([
          adminApi.getClientById(id),
          adminApi.getClientLoans(id),
          adminApi.getClientDocuments(id),
          adminApi.getClientBankAccount(id)
        ]);
        setClient(clientData);
        setLoans(loansData || []);
        setDocuments(docsData || []);
        setBankAccount(bankData);
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
      logger.logError('Error loading client', err);
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
            <Button variant="primary" onClick={() => window.location.href = `tel:${client.phone || ''}`} disabled={!client.phone}>
              📞 Appeler
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => window.location.href = `mailto:${client.email || ''}`}
              disabled={!client.email}
            >
              📧 Email
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowAccountEmailModal(true)}
              disabled={!client.email}
            >
              🔐 Envoyer identifiants
            </Button>
            <Button variant="ghost" onClick={() => setShowCallbackModal(true)}>+ Rappel</Button>
            {isAdmin && (
              <Button 
                variant="danger" 
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Supprimer
              </Button>
            )}
          </div>

          {/* Client Status Selector with History */}
          <div className="status-selector-row fade-in">
            <span className="status-label">Statut client :</span>
            <ClientStatusSelect 
              clientId={id || ''} 
              currentStatus={client.pipeline_stage} 
              onStatusChange={(newStatus) => setClient(prev => prev ? {...prev, pipeline_stage: newStatus} : null)}
            />
          </div>
          
          {/* Status History */}
          <div className="status-history-section fade-in" style={{ marginBottom: '1rem' }}>
            <ClientStatusHistory clientId={id || ''} />
          </div>

          {/* Tabs */}
          <div className="tabs fade-in">
            <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Informations</button>
            <button className={`tab ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>Dossiers ({loans.length})</button>
            <button className={`tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Documents ({documents.length})</button>
          </div>

          {activeTab === 'info' && (
            <>
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

              {/* Admin-only: Bank Account Section */}
              {isAdmin && (
                <div className="bank-card-wrapper">
                  <Card className="bank-card fade-in" padding="lg">
                    <div className="bank-header">
                      <h3>💳 Compte bancaire</h3>
                      <Button variant="primary" size="sm" onClick={() => setShowBankModal(true)}>
                        ✏️ Modifier
                      </Button>
                    </div>
                    <div className="info-grid">
                      <div className="info-row">
                        <span>Solde</span>
                        <strong className="balance-value">{formatCurrency(bankAccount?.balance || 0)}</strong>
                      </div>
                      <div className="info-row">
                        <span>IBAN</span>
                        <strong className="iban-value">{bankAccount?.iban || 'Non défini'}</strong>
                      </div>
                      <div className="info-row">
                        <span>BIC</span>
                        <strong>{bankAccount?.bic || '-'}</strong>
                      </div>
                    </div>
                    <p className="admin-notice">⚠️ Seul un administrateur peut modifier ces informations</p>
                  </Card>
                </div>
              )}
            </>
          )}

          {activeTab === 'loans' && (
            <Card className="loans-card fade-in" padding="lg">
              <h3>Dossiers de prêt</h3>
              {loans.length === 0 ? (
                <p className="empty-text">Aucun dossier</p>
              ) : (
                <div className="loans-list">
                  {loans.map(loan => (
                    <div key={loan.id} className="loan-item">
                      <div className="loan-main" onClick={() => navigate(`/loans/${loan.id}`)}>
                        <span className="loan-ref">#{loan.id.slice(0, 8)}</span>
                        <span className="loan-amount">{formatCurrency(loan.amount)}</span>
                      </div>
                      <div className="loan-meta">
                        <span>{loan.duration} ans • {loan.rate}%</span>
                        <StatusBadge status={loan.status} size="sm" />
                        <button 
                          className="status-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLoan(loan);
                            setShowLoanStatusModal(true);
                          }}
                          title="Modifier le statut"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'documents' && (
            <Card className="docs-card fade-in" padding="lg">
              <div className="docs-header">
                <h3>📤 Documents du client</h3>
                {isAdmin && client && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setShowAdminUploadModal(true)}
                  >
                    📥 Envoyer un document
                  </Button>
                )}
              </div>
              {documents.length === 0 ? (
                <p className="empty-text">Aucun document uploadé par le client</p>
              ) : (
                <div className="docs-list">
                  {documents.filter(d => (d as any).direction !== 'incoming').map(doc => (
                    <div key={doc.id} className="doc-item">
                      <span className="doc-icon">📄</span>
                      <div className="doc-info">
                        <span className="doc-name">{doc.file_name}</span>
                        <span className="doc-meta">{doc.category} • {formatDate(doc.uploaded_at)}</span>
                      </div>
                      <StatusBadge status={doc.status} size="sm" />
                      <button 
                        className="status-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(doc);
                          setShowDocumentStatusModal(true);
                        }}
                        title="Modifier le statut"
                      >
                        ✏️
                      </button>
                      <button 
                        className="download-btn"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!doc.file_path) {
                            toast.error('Chemin du fichier non disponible');
                            return;
                          }
                          try {
                            const result = await storageService.getDocumentUrl(doc.file_path);
                            if (result.success && result.url) {
                              window.open(result.url, '_blank');
                            } else {
                              toast.error(result.error || 'Erreur lors du téléchargement');
                            }
                          } catch (err) {
                            logger.logError('Download error', err);
                            toast.error('Erreur lors du téléchargement');
                          }
                        }}
                        title="Télécharger"
                      >
                        ⬇️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents envoyés au client */}
              {documents.filter(d => (d as any).direction === 'incoming').length > 0 && (
                <div className="sent-docs-section">
                  <h4>📥 Documents envoyés au client</h4>
                  <div className="docs-list">
                    {documents.filter(d => (d as any).direction === 'incoming').map(doc => (
                      <div key={doc.id} className="doc-item sent">
                        <span className="doc-icon">📋</span>
                        <div className="doc-info">
                          <span className="doc-name">{doc.file_name}</span>
                          <span className="doc-meta">
                            {doc.category} • {formatDate(doc.uploaded_at)}
                            {(doc as any).motif && ` • ${(doc as any).motif.slice(0, 50)}...`}
                          </span>
                        </div>
                        <StatusBadge status="approved" size="sm" />
                        <button 
                          className="download-btn"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!doc.file_path) return;
                            try {
                              const result = await storageService.getDocumentUrl(doc.file_path);
                              if (result.success && result.url) {
                                window.open(result.url, '_blank');
                              }
                            } catch (err) {
                              toast.error('Erreur lors du téléchargement');
                            }
                          }}
                          title="Télécharger"
                        >
                          ⬇️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Callback Modal */}
        <CreateCallbackModal
          isOpen={showCallbackModal}
          onClose={() => setShowCallbackModal(false)}
          onSuccess={() => {
            toast.success('Rappel planifié avec succès');
          }}
          preselectedClientId={id}
          preselectedClientName={`${client.first_name} ${client.last_name}`}
        />

        {/* Document Status Modal */}
        <DocumentStatusModal
          isOpen={showDocumentStatusModal}
          onClose={() => {
            setShowDocumentStatusModal(false);
            setSelectedDocument(null);
          }}
          onSuccess={loadClientData}
          document={selectedDocument ? {
            id: selectedDocument.id,
            file_name: selectedDocument.file_name,
            status: selectedDocument.status || 'pending',
            user_id: selectedDocument.user_id,
          } : null}
        />

        {/* Loan Status Modal */}
        <LoanStatusModal
          isOpen={showLoanStatusModal}
          onClose={() => {
            setShowLoanStatusModal(false);
            setSelectedLoan(null);
          }}
          onSuccess={loadClientData}
          loan={selectedLoan ? {
            id: selectedLoan.id,
            status: selectedLoan.status || 'pending',
            user_id: selectedLoan.user_id,
            amount: selectedLoan.amount,
          } : null}
        />

        {/* Admin Bank Account Modal */}
        {isAdmin && client && id && (
          <ClientBankModal
            isOpen={showBankModal}
            onClose={() => setShowBankModal(false)}
            onSuccess={() => {
              toast.success('Compte bancaire mis à jour');
              loadClientData();
            }}
            clientId={id}
            currentBalance={bankAccount?.balance || null}
            currentIban={bankAccount?.iban || null}
            currentBic={bankAccount?.bic || null}
            clientName={`${client.first_name} ${client.last_name}`}
          />
        )}

        {/* Admin Document Upload Modal */}
        {isAdmin && client && id && (
          <AdminDocumentUploadModal
            isOpen={showAdminUploadModal}
            onClose={() => setShowAdminUploadModal(false)}
            onSuccess={loadClientData}
            clientId={id}
            clientName={`${client.first_name} ${client.last_name}`}
          />
        )}

        {/* Delete Client Modal (Admin only) */}
        {isAdmin && client && (
          <DeleteClientModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onSuccess={() => {
              toast.success('Client supprimé avec succès');
              navigate(backPath);
            }}
            client={client}
          />
        )}

        {/* Send Account Email Modal */}
        <SendAccountEmailModal
          isOpen={showAccountEmailModal}
          onClose={() => setShowAccountEmailModal(false)}
          clientEmail={client.email || ''}
          clientFirstName={client.first_name || ''}
        />
      </div>
    </PageLayout>
  );
};

export default AgentClientDetail;
