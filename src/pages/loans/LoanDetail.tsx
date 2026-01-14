import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { loansApi, documentsApi, messagesApi, adminApi, formatCurrency, formatDate, formatDateTime } from '@/services/api';
import type { LoanApplication, Document, Message, Profile } from '@/services/api';
import DocumentUpload from '@/components/documents/DocumentUpload';
import CoborrowerDocumentUpload from '@/components/documents/CoborrowerDocumentUpload';
import DocumentChecklist from '@/components/loans/DocumentChecklist';
import NotaryPanel from '@/components/loans/NotaryPanel';
import SequestrePanel from '@/components/loans/SequestrePanel';
import ReceivedDocumentsList from '@/components/documents/ReceivedDocumentsList';
import AdminDocumentUploadModal from '@/components/admin/AdminDocumentUploadModal';
import { useToast } from '@/components/finom/Toast';
import { useUserRoles } from '@/hooks/useUserRoles';
import type { ProjectType } from '@/lib/documentChecklist';
import { logger } from '@/lib/logger';

const LoanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAgent, isAdmin } = useUserRoles();
  
  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [assignedAgent, setAssignedAgent] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'messages' | 'timeline'>('overview');
  const [activeDocOwner, setActiveDocOwner] = useState<'all' | 'primary' | 'co_borrower'>('all');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showAdminUploadModal, setShowAdminUploadModal] = useState(false);
  const [clientProfile, setClientProfile] = useState<Profile | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (id) loadLoanData();
  }, [id]);

  const loadLoanData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [loanData, docsData, msgsData] = await Promise.all([
        loansApi.getById(id),
        documentsApi.getByLoan(id, 'outgoing'), // Only client-uploaded docs
        messagesApi.getByLoan(id)
      ]);
      setLoan(loanData);
      setDocuments(docsData || []);
      setMessages(msgsData || []);
      
      // Load assigned agent for this loan's owner
      if (loanData?.user_id) {
        try {
          const agent = await adminApi.getClientAgent(loanData.user_id);
          setAssignedAgent(agent);
          
          // For admin/agent, also load client profile
          if (isAdmin || isAgent) {
            const profile = await adminApi.getClientById(loanData.user_id);
            setClientProfile(profile);
          }
        } catch {
          // User may not have permission to get agent info
        }
      }
    } catch (err) {
      logger.logError('Error loading loan', err);
      setError('Impossible de charger ce dossier');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || !user || !loan) return;
    
    try {
      setSendingMessage(true);
      
      // Determine recipient based on who is sending
      const isOwner = loan.user_id === user.id;
      let toUserId: string;
      
      if (isOwner) {
        // Client sending message -> send to assigned agent or loan owner (self for now if no agent)
        toUserId = assignedAgent?.id || loan.user_id;
      } else {
        // Agent/Admin sending message -> send to loan owner (client)
        toUserId = loan.user_id;
      }
      
      await messagesApi.send({
        loan_id: id,
        from_user_id: user.id,
        to_user_id: toUserId,
        message: newMessage.trim()
      });
      setNewMessage('');
      // Reload messages
      const msgsData = await messagesApi.getByLoan(id);
      setMessages(msgsData || []);
    } catch (err) {
      logger.logError('Error sending message', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const getTimelineEvents = () => {
    const events = [
      { date: loan?.created_at, label: 'Demande créée', icon: '📝', status: 'completed' },
    ];

    if (loan?.status !== 'draft' && loan?.status !== 'pending') {
      events.push({ date: loan?.updated_at, label: 'Dossier en cours d\'analyse', icon: '🔍', status: 'completed' });
    }

    if (loan?.status === 'approved' || loan?.status === 'funded') {
      events.push({ date: loan?.updated_at, label: 'Dossier approuvé', icon: '✅', status: 'completed' });
    }

    if (loan?.status === 'funded') {
      events.push({ date: loan?.updated_at, label: 'Financement effectué', icon: '💰', status: 'completed' });
    }

    if (loan?.status === 'rejected') {
      events.push({ date: loan?.updated_at, label: 'Dossier refusé', icon: '❌', status: 'completed' });
    }

    // Add pending steps
    if (loan?.status === 'pending') {
      events.push({ date: null, label: 'Analyse du dossier', icon: '🔍', status: 'pending' });
      events.push({ date: null, label: 'Décision', icon: '📋', status: 'upcoming' });
    }

    if (loan?.status === 'in_review' || loan?.status === 'under_review') {
      events.push({ date: null, label: 'Décision', icon: '📋', status: 'pending' });
    }

    if (loan?.status === 'documents_required') {
      events.push({ date: null, label: 'Documents en attente', icon: '📋', status: 'pending' });
      events.push({ date: null, label: 'Analyse', icon: '🔍', status: 'upcoming' });
    }

    if (loan?.status === 'processing') {
      events.push({ date: null, label: 'Finalisation', icon: '⚙️', status: 'pending' });
    }

    if (loan?.status === 'approved') {
      events.push({ date: null, label: 'Financement', icon: '💰', status: 'pending' });
    }

    return events;
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner fullPage message="Chargement du dossier..." />
      </PageLayout>
    );
  }

  if (error || !loan) {
    return (
      <PageLayout>
        <div className="error-page">
          <Card padding="xl">
            <h2>Erreur</h2>
            <p>{error || 'Dossier non trouvé'}</p>
            <Button variant="primary" onClick={() => navigate('/loans')}>
              Retour à mes dossiers
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="loan-detail-page">
        <div className="page-header">
          <div className="container">
            <button className="back-button" onClick={() => navigate('/loans')}>
              ← Retour aux dossiers
            </button>
            <div className="header-content">
              <div className="header-info">
                <span className="loan-ref">Dossier #{loan.id.slice(0, 8)}</span>
                <h1>{formatCurrency(loan.amount)}</h1>
                <p>
                  {loan.duration} ans • {loan.rate}%
                  {loan.has_coborrower && <span className="coborrower-indicator">👥 Co-emprunteur</span>}
                </p>
              </div>
              <StatusBadge status={loan.status} />
            </div>
          </div>
        </div>

        <div className="container">
          {/* Tabs */}
          <div className="tabs fade-in">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Aperçu
            </button>
            <button 
              className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents ({documents.length})
            </button>
            <button 
              className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages ({messages.length})
            </button>
            <button 
              className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              Suivi
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content fade-in">
              <div className="overview-grid">
                <Card className="summary-card" padding="lg">
                  <h3>Résumé du financement</h3>
                  <div className="summary-rows">
                    {loan.property_price && loan.property_price > 0 && (
                      <div className="summary-row">
                        <span>Prix du bien</span>
                        <strong>{formatCurrency(loan.property_price)}</strong>
                      </div>
                    )}
                    {loan.down_payment !== undefined && loan.down_payment !== null && (
                      <div className="summary-row highlight-apport">
                        <span>Apport personnel</span>
                        <strong>{formatCurrency(loan.down_payment)} {loan.property_price && loan.property_price > 0 ? `(${((loan.down_payment / loan.property_price) * 100).toFixed(0)}%)` : ''}</strong>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Montant emprunté</span>
                      <strong>{formatCurrency(loan.amount)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Durée</span>
                      <strong>{loan.duration} ans</strong>
                    </div>
                    <div className="summary-row">
                      <span>Taux</span>
                      <strong>{loan.rate}%</strong>
                    </div>
                    <div className="summary-row highlight">
                      <span>Mensualité</span>
                      <strong>{formatCurrency(loan.monthly_payment)}/mois</strong>
                    </div>
                    <div className="summary-row">
                      <span>Coût total des intérêts</span>
                      <strong>{formatCurrency(loan.total_interest)}</strong>
                    </div>
                  </div>
                </Card>

                <Card className="status-card" padding="lg">
                  <h3>État du dossier</h3>
                  <div className="status-info">
                    <StatusBadge status={loan.status} />
                    <p className="status-description">
                      {loan.status === 'pending' && 'Votre demande est en attente de traitement.'}
                      {(loan.status === 'in_review' || loan.status === 'under_review') && 'Votre dossier est en cours d\'analyse par nos équipes.'}
                      {loan.status === 'documents_required' && 'Des documents supplémentaires sont nécessaires pour traiter votre dossier.'}
                      {loan.status === 'processing' && 'Votre dossier est en cours de traitement final.'}
                      {loan.status === 'approved' && 'Félicitations ! Votre demande a été approuvée.'}
                      {loan.status === 'rejected' && 'Votre demande n\'a pas pu être acceptée.'}
                      {loan.status === 'funded' && 'Le financement a été effectué.'}
                    </p>
                    {loan.next_action && (
                      <div className="next-action">
                        <strong>Prochaine étape:</strong> {loan.next_action}
                      </div>
                    )}
                    {loan.rejection_reason && (
                      <div className="rejection-reason">
                        <strong>Motif:</strong> {loan.rejection_reason}
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="dates-card" padding="lg">
                  <h3>Dates clés</h3>
                  <div className="dates-list">
                    <div className="date-item">
                      <span className="date-label">Créé le</span>
                      <span className="date-value">{formatDateTime(loan.created_at)}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Dernière mise à jour</span>
                      <span className="date-value">{formatDateTime(loan.updated_at)}</span>
                    </div>
                  </div>
                </Card>

                {/* Séquestre Panel - visible to all */}
                <SequestrePanel
                  loanId={loan.id}
                  sequestreStatus={loan.sequestre_status || 'none'}
                  amountExpected={loan.sequestre_amount_expected || 0}
                  amountReceived={loan.sequestre_amount_received || 0}
                  onUpdate={isAgent || isAdmin ? async (data) => {
                    await loansApi.update(loan.id, data);
                    loadLoanData();
                    toast.success('Séquestre mis à jour');
                  } : undefined}
                  readOnly={!isAgent && !isAdmin}
                />

                {/* Notary Panel - visible to all */}
                <NotaryPanel
                  loanId={loan.id}
                  notaryRef={loan.notary_ref || null}
                  notaryIban={loan.notary_iban || null}
                  onUpdate={isAgent || isAdmin ? async (data) => {
                    await loansApi.update(loan.id, data);
                    loadLoanData();
                    toast.success('Informations notaire mises à jour');
                  } : undefined}
                  readOnly={!isAgent && !isAdmin}
                />

                {/* Document Checklist based on project type */}
                {(loan as any).project_type && (
                  <DocumentChecklist
                    projectType={(loan as any).project_type as ProjectType}
                    uploadedDocuments={documents}
                    onUploadClick={() => setActiveTab('documents')}
                  />
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="tab-content fade-in">
              {/* Client-uploaded Documents */}
              <Card padding="lg">
                <div className="documents-header">
                  <h3>📤 Documents envoyés</h3>
                  <div className="documents-actions">
                    {(isAdmin || isAgent) && loan && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => setShowAdminUploadModal(true)}
                      >
                        📥 Envoyer au client
                      </Button>
                    )}
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowUploadSection(!showUploadSection)}
                    >
                      {showUploadSection ? '✕ Fermer' : '+ Ajouter un document'}
                    </Button>
                  </div>
                </div>

                {showUploadSection && (
                  <div className="upload-section">
                    <CoborrowerDocumentUpload
                      loanId={id}
                      hasCoborrower={loan?.has_coborrower || false}
                      onUploadComplete={() => {
                        toast.success('Document ajouté avec succès');
                        setShowUploadSection(false);
                        loadLoanData();
                      }}
                      onError={(err) => toast.error(err)}
                    />
                  </div>
                )}

                {/* Document filter tabs when has coborrower */}
                {loan?.has_coborrower && documents.length > 0 && (
                  <div className="doc-owner-tabs">
                    <button 
                      className={`doc-owner-tab ${activeDocOwner === 'all' ? 'active' : ''}`}
                      onClick={() => setActiveDocOwner('all')}
                    >
                      Tous ({documents.length})
                    </button>
                    <button 
                      className={`doc-owner-tab ${activeDocOwner === 'primary' ? 'active' : ''}`}
                      onClick={() => setActiveDocOwner('primary')}
                    >
                      👤 Emprunteur ({documents.filter(d => !d.document_owner || d.document_owner === 'primary').length})
                    </button>
                    <button 
                      className={`doc-owner-tab ${activeDocOwner === 'co_borrower' ? 'active' : ''}`}
                      onClick={() => setActiveDocOwner('co_borrower')}
                    >
                      👥 Co-emprunteur ({documents.filter(d => d.document_owner === 'co_borrower').length})
                    </button>
                  </div>
                )}

                {documents.length === 0 && !showUploadSection ? (
                  <div className="empty-docs">
                    <span className="empty-icon">📄</span>
                    <p>Aucun document envoyé dans ce dossier</p>
                    <Button variant="primary" size="sm" onClick={() => setShowUploadSection(true)}>
                      Ajouter un document
                    </Button>
                  </div>
                ) : documents.length > 0 && (
                  <div className="documents-list">
                    {documents
                      .filter(doc => {
                        if (activeDocOwner === 'all') return true;
                        if (activeDocOwner === 'primary') return !doc.document_owner || doc.document_owner === 'primary';
                        return doc.document_owner === activeDocOwner;
                      })
                      .map(doc => (
                        <div key={doc.id} className={`document-item outgoing ${doc.document_owner === 'co_borrower' ? 'coborrower-doc' : ''}`}>
                          <div className="doc-icon">📄</div>
                          <div className="doc-info">
                            <span className="doc-name">{doc.file_name}</span>
                            <span className="doc-meta">
                              {doc.category} • {formatDate(doc.uploaded_at)}
                              {loan?.has_coborrower && (
                                <span className="doc-owner-badge">
                                  {doc.document_owner === 'co_borrower' ? ' • 👥 Co-emprunteur' : ' • 👤 Emprunteur'}
                                </span>
                              )}
                            </span>
                          </div>
                          <StatusBadge status={doc.status} size="sm" />
                        </div>
                      ))}
                  </div>
                )}
              </Card>

              {/* Received Documents - Only visible to client OR admin viewing client's loan */}
              {id && <ReceivedDocumentsList loanId={id} />}

              {/* Admin Upload Modal */}
              {(isAdmin || isAgent) && loan && clientProfile && (
                <AdminDocumentUploadModal
                  isOpen={showAdminUploadModal}
                  onClose={() => setShowAdminUploadModal(false)}
                  onSuccess={loadLoanData}
                  clientId={loan.user_id}
                  clientName={`${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`}
                  loanId={id}
                />
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="tab-content fade-in">
              <Card padding="lg">
                <h3>Messagerie</h3>
                
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <span className="empty-icon">💬</span>
                    <p>Aucun message pour ce dossier</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`message-item ${msg.from_user_id === user?.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-bubble">
                          <p>{msg.message}</p>
                          <span className="message-time">{formatDateTime(msg.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="message-input">
                  <input 
                    type="text" 
                    placeholder="Votre message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sendingMessage}
                  />
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    {sendingMessage ? '...' : 'Envoyer'}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="tab-content fade-in">
              <Card padding="lg">
                <h3>Suivi de votre dossier</h3>
                <div className="timeline">
                  {getTimelineEvents().map((event, index) => (
                    <div key={index} className={`timeline-item ${event.status}`}>
                      <div className="timeline-marker">
                        <span className="timeline-icon">{event.icon}</span>
                      </div>
                      <div className="timeline-content">
                        <span className="timeline-label">{event.label}</span>
                        {event.date && (
                          <span className="timeline-date">{formatDateTime(event.date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        <style>{`
          .loan-detail-page {
            min-height: 100vh;
            background: var(--color-bg);
            padding-bottom: 4rem;
          }

          .page-header {
            background: linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 100%);
            color: white;
            padding: 2rem 1.5rem 3rem;
            margin-bottom: -1rem;
          }

          .back-button {
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.8);
            cursor: pointer;
            padding: 0;
            font-size: 0.9rem;
            margin-bottom: 1rem;
          }

          .back-button:hover {
            color: white;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .loan-ref {
            font-size: 0.85rem;
            opacity: 0.8;
            font-family: monospace;
          }

          .page-header h1 {
            color: white;
            font-size: 2.5rem;
            margin: 0.25rem 0;
          }

          .page-header p {
            opacity: 0.9;
            margin: 0;
          }

          .coborrower-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: rgba(255,255,255,0.2);
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-full);
            margin-left: 0.75rem;
            font-size: 0.85rem;
          }

          .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 1.5rem;
          }

          .tabs {
            display: flex;
            gap: 0.5rem;
            background: white;
            padding: 0.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            margin-bottom: 1.5rem;
          }

          .tab {
            flex: 1;
            padding: 0.875rem 1rem;
            border: none;
            background: transparent;
            border-radius: var(--radius-md);
            font-weight: 600;
            color: var(--color-text-secondary);
            cursor: pointer;
            transition: all 0.2s;
          }

          .tab:hover {
            background: var(--color-surface-hover);
          }

          .tab.active {
            background: var(--color-primary);
            color: white;
          }

          .tab-content {
            margin-bottom: 2rem;
          }

          .overview-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .summary-card {
            grid-column: span 2;
          }

          .summary-rows {
            display: flex;
            flex-direction: column;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 0.875rem 0;
            border-bottom: 1px solid var(--color-border);
          }

          .summary-row:last-child {
            border-bottom: none;
          }

          .summary-row.highlight {
            color: var(--color-primary);
            font-size: 1.1rem;
          }

          .summary-row.highlight-apport {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            padding: 0.875rem 1rem;
            margin: 0.25rem -1rem;
            border-radius: var(--radius-sm);
            border-bottom: none;
            font-weight: 600;
          }

          .summary-row.highlight-apport span {
            color: #047857;
          }

          .summary-row.highlight-apport strong {
            color: #065f46;
          }

          .status-card h3,
          .dates-card h3 {
            margin-bottom: 1rem;
          }

          .status-description {
            color: var(--color-text-secondary);
            margin: 1rem 0;
          }

          .next-action,
          .rejection-reason {
            background: #f8fafc;
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-top: 1rem;
            font-size: 0.9rem;
          }

          .rejection-reason {
            background: #fee2e2;
            color: #991b1b;
          }

          .date-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
          }

          .date-label {
            color: var(--color-text-secondary);
          }

          .documents-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .documents-header h3 {
            margin: 0;
          }

          .documents-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .upload-section {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: var(--radius-md);
          }

          .empty-docs,
          .empty-messages {
            text-align: center;
            padding: 3rem;
          }

          .empty-icon {
            font-size: 3rem;
            display: block;
            margin-bottom: 1rem;
          }

          .documents-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .document-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: var(--radius-md);
          }

          .doc-icon {
            font-size: 1.5rem;
          }

          .doc-info {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .doc-name {
            font-weight: 600;
          }

          .doc-meta {
            font-size: 0.8rem;
            color: var(--color-text-tertiary);
          }

          .doc-owner-badge {
            color: var(--color-primary);
          }

          .doc-owner-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--color-border);
          }

          .doc-owner-tab {
            padding: 0.5rem 1rem;
            border: none;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-full);
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--color-text-secondary);
            cursor: pointer;
            transition: all 0.2s;
          }

          .doc-owner-tab:hover {
            background: var(--color-surface-hover);
          }

          .doc-owner-tab.active {
            background: var(--color-primary);
            color: white;
          }

          .document-item.coborrower-doc {
            border-left: 3px solid var(--color-primary);
          }

          .messages-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .message-item.sent {
            align-self: flex-end;
          }

          .message-bubble {
            max-width: 70%;
            padding: 1rem;
            border-radius: var(--radius-lg);
            background: #f1f5f9;
          }

          .message-item.sent .message-bubble {
            background: var(--color-primary);
            color: white;
          }

          .message-time {
            display: block;
            font-size: 0.75rem;
            opacity: 0.7;
            margin-top: 0.5rem;
          }

          .message-input {
            display: flex;
            gap: 0.75rem;
          }

          .message-input input {
            flex: 1;
          }

          .timeline {
            position: relative;
            padding-left: 2rem;
          }

          .timeline::before {
            content: '';
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--color-border);
          }

          .timeline-item {
            position: relative;
            padding-bottom: 1.5rem;
          }

          .timeline-marker {
            position: absolute;
            left: -2rem;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: white;
            border: 2px solid var(--color-border);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .timeline-item.completed .timeline-marker {
            border-color: var(--color-success);
            background: #d1fae5;
          }

          .timeline-item.pending .timeline-marker {
            border-color: var(--color-primary);
            background: #fce7f3;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(254, 66, 180, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(254, 66, 180, 0); }
          }

          .timeline-content {
            display: flex;
            flex-direction: column;
            padding-left: 1rem;
          }

          .timeline-label {
            font-weight: 600;
          }

          .timeline-date {
            font-size: 0.8rem;
            color: var(--color-text-tertiary);
          }

          .timeline-item.upcoming .timeline-label {
            color: var(--color-text-tertiary);
          }

          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 768px) {
            .overview-grid {
              grid-template-columns: 1fr;
            }

            .summary-card {
              grid-column: span 1;
            }

            .tabs {
              overflow-x: auto;
            }

            .tab {
              white-space: nowrap;
            }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default LoanDetail;
