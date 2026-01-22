import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { 
  RefreshCw, FileText, Search, CheckCircle2, XCircle, Coins, 
  Clock, ClipboardList, Cog, Mail, Users, User, ArrowUpFromLine,
  ArrowDownToLine, X, Plus, FileStack, MessageCircle, Calendar, Calculator, ListChecks
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { loansApi, documentsApi, messagesApi, adminApi, formatCurrency, formatDate, formatDateTime } from '@/services/api';
import type { LoanApplication, Document, Message, Profile } from '@/services/api';
import DocumentUpload from '@/components/documents/DocumentUpload';
import CoborrowerDocumentUpload from '@/components/documents/CoborrowerDocumentUpload';
import DocumentChecklist from '@/components/loans/DocumentChecklist';
import NotaryPanel from '@/components/loans/NotaryPanel';
import SequestrePanel from '@/components/loans/SequestrePanel';
import ReceivedDocumentsList from '@/components/documents/ReceivedDocumentsList';
import ReplaceDocumentButton from '@/components/documents/ReplaceDocumentButton';
import DownloadAllDocuments from '@/components/documents/DownloadAllDocuments';
import DocumentExpirationBadge from '@/components/documents/DocumentExpirationBadge';
import AdminDocumentUploadModal from '@/components/admin/AdminDocumentUploadModal';
import BulkDocumentStatusModal from '@/components/agent/BulkDocumentStatusModal';
import { useToast } from '@/components/finom/Toast';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useDocumentProgress } from '@/hooks/useDocumentProgress';
import { useSequestreAlert } from '@/hooks/useSequestreAlert';
import type { ProjectType } from '@/lib/documentChecklist';
import { logger } from '@/lib/logger';
import LoanStatusHistory from '@/components/agent/LoanStatusHistory';
import DocumentStatusHistory from '@/components/agent/DocumentStatusHistory';
import LoanTimeline from '@/components/loans/LoanTimeline';
import AmortizationSchedule from '@/components/loans/AmortizationSchedule';
import AppointmentBooking from '@/components/appointments/AppointmentBooking';
import { supabase } from '@/integrations/supabase/client';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'messages' | 'timeline' | 'schedule'>('overview');
  const [activeDocOwner, setActiveDocOwner] = useState<'all' | 'primary' | 'co_borrower'>('all');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showAdminUploadModal, setShowAdminUploadModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [clientProfile, setClientProfile] = useState<Profile | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [statusHistory, setStatusHistory] = useState<Array<{ new_status: string; created_at: string; notes?: string | null }>>([]);
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
      
      // Load status history for timeline
      try {
        const { data: historyData } = await supabase
          .from('loan_status_history')
          .select('new_status, created_at, notes')
          .eq('loan_id', id)
          .order('created_at', { ascending: true });
        if (historyData) {
          setStatusHistory(historyData);
        }
      } catch {
        // Silently fail for non-authorized users
      }
      
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
      setError('Impossible de charger ce dossier. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadLoanData();
  };

  // Auto-transition hook when documents are complete
  useDocumentProgress({
    loanId: id || '',
    userId: loan?.user_id || '',
    projectType: (loan?.project_type as ProjectType) || 'achat_residence_principale',
    currentStatus: loan?.status || null,
    hasCoborrower: loan?.has_coborrower || false,
    onStatusChange: loadLoanData,
  });

  // Sequestre 100% alert hook
  useSequestreAlert({
    loanId: id || '',
    userId: loan?.user_id || '',
    amountExpected: loan?.sequestre_amount_expected || 0,
    amountReceived: loan?.sequestre_amount_received || 0,
    sequestreStatus: loan?.sequestre_status || 'none',
  });

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
      { date: loan?.created_at, label: 'Demande créée', icon: 'FileText', status: 'completed' },
    ];

    if (loan?.status !== 'draft' && loan?.status !== 'pending') {
      events.push({ date: loan?.updated_at, label: 'Dossier en cours d\'analyse', icon: 'Search', status: 'completed' });
    }

    if (loan?.status === 'approved' || loan?.status === 'funded') {
      events.push({ date: loan?.updated_at, label: 'Dossier approuvé', icon: 'CheckCircle2', status: 'completed' });
    }

    if (loan?.status === 'funded') {
      events.push({ date: loan?.updated_at, label: 'Financement effectué', icon: 'Coins', status: 'completed' });
    }

    if (loan?.status === 'rejected') {
      events.push({ date: loan?.updated_at, label: 'Dossier refusé', icon: 'XCircle', status: 'completed' });
    }

    // Add pending steps
    if (loan?.status === 'pending') {
      events.push({ date: null, label: 'Analyse du dossier', icon: 'Search', status: 'pending' });
      events.push({ date: null, label: 'Décision', icon: 'ClipboardList', status: 'upcoming' });
    }

    if (loan?.status === 'in_review' || loan?.status === 'under_review') {
      events.push({ date: null, label: 'Décision', icon: 'ClipboardList', status: 'pending' });
    }

    if (loan?.status === 'documents_required') {
      events.push({ date: null, label: 'Documents en attente', icon: 'ClipboardList', status: 'pending' });
      events.push({ date: null, label: 'Analyse', icon: 'Search', status: 'upcoming' });
    }

    if (loan?.status === 'processing') {
      events.push({ date: null, label: 'Finalisation', icon: 'Cog', status: 'pending' });
    }

    if (loan?.status === 'offer_issued') {
      events.push({ date: loan?.updated_at, label: 'Offre émise', icon: 'Mail', status: 'completed' });
      events.push({ date: null, label: 'Acceptation (10 jours)', icon: 'Clock', status: 'pending' });
    }

    if (loan?.status === 'approved') {
      events.push({ date: null, label: 'Financement', icon: 'Coins', status: 'pending' });
    }

    return events;
  };

  const TimelineIcon = ({ name }: { name: string }) => {
    const icons: Record<string, React.ReactNode> = {
      'FileText': <FileText size={16} />,
      'Search': <Search size={16} />,
      'CheckCircle2': <CheckCircle2 size={16} />,
      'Coins': <Coins size={16} />,
      'XCircle': <XCircle size={16} />,
      'ClipboardList': <ClipboardList size={16} />,
      'Cog': <Cog size={16} />,
      'Mail': <Mail size={16} />,
      'Clock': <Clock size={16} />,
    };
    return <>{icons[name] || <FileText size={16} />}</>;
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
            <div className="error-actions">
              {error && (
                <Button variant="secondary" onClick={handleRetry}>
                  <RefreshCw size={16} className="retry-btn-icon" />
                  Réessayer
                </Button>
              )}
              <Button variant="primary" onClick={() => navigate('/loans')}>
                Retour à mes dossiers
              </Button>
            </div>
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
                  {loan.has_coborrower && <span className="coborrower-indicator"><Users size={14} className="inline-icon" /> Co-emprunteur</span>}
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
            <button 
              className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Calculator size={14} className="inline mr-1" />
              Échéancier
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content fade-in">
              <div className="overview-grid">
                {/* Borrower Type Card */}
                <Card className="borrower-type-card" padding="lg">
                  <h3>
                    {loan.borrower_type === 'entreprise' ? (
                      <><FileText size={18} /> Type d'emprunteur</>
                    ) : (
                      <><User size={18} /> Type d'emprunteur</>
                    )}
                  </h3>
                  <div className="borrower-type-info">
                    <div className="borrower-badge-wrapper">
                      {loan.borrower_type === 'entreprise' ? (
                        <span className="borrower-badge entreprise">
                          <span className="inline-icon">
                            <FileText size={20} />
                          </span>
                          Entreprise
                        </span>
                      ) : (
                        <span className="borrower-badge particulier">
                          <span className="inline-icon">
                            <User size={20} />
                          </span>
                          Particulier
                        </span>
                      )}
                    </div>
                    {loan.borrower_type === 'entreprise' && (
                      <div className="company-details">
                        {loan.company_name && (
                          <div className="company-row">
                            <span className="company-label">Raison sociale</span>
                            <strong>{loan.company_name}</strong>
                          </div>
                        )}
                        {loan.company_siret && (
                          <div className="company-row">
                            <span className="company-label">SIRET</span>
                            <strong className="siret-value">{loan.company_siret}</strong>
                          </div>
                        )}
                        {loan.company_legal_form && (
                          <div className="company-row">
                            <span className="company-label">Forme juridique</span>
                            <strong>{loan.company_legal_form}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

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
                      {loan.status === 'offer_issued' && 'Une offre de prêt vous a été émise. Vous disposez d\'un délai légal de 10 jours pour l\'accepter.'}
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

                {/* Co-borrower Info Card */}
                {loan.has_coborrower && loan.coborrower_data && (
                  <Card className="coborrower-card" padding="lg">
                    <h3><Users size={18} className="inline-icon" /> Informations Co-emprunteur</h3>
                    <div className="coborrower-info">
                      {(() => {
                        const coData = loan.coborrower_data as Record<string, unknown>;
                        return (
                          <div className="summary-rows">
                            {coData.firstName && (
                              <div className="summary-row">
                                <span>Prénom</span>
                                <strong>{String(coData.firstName)}</strong>
                              </div>
                            )}
                            {coData.lastName && (
                              <div className="summary-row">
                                <span>Nom</span>
                                <strong>{String(coData.lastName)}</strong>
                              </div>
                            )}
                            {coData.email && (
                              <div className="summary-row">
                                <span>Email</span>
                                <strong>{String(coData.email)}</strong>
                              </div>
                            )}
                            {coData.phone && (
                              <div className="summary-row">
                                <span>Téléphone</span>
                                <strong>{String(coData.phone)}</strong>
                              </div>
                            )}
                            {coData.income && (
                              <div className="summary-row">
                                <span>Revenus nets mensuels</span>
                                <strong>{formatCurrency(Number(coData.income))}</strong>
                              </div>
                            )}
                            {coData.employmentStatus && (
                              <div className="summary-row">
                                <span>Situation professionnelle</span>
                                <strong>{String(coData.employmentStatus)}</strong>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </Card>
                )}

                {/* Document Checklist based on project type */}
                {loan.project_type && (
                  <DocumentChecklist
                    projectType={loan.project_type as ProjectType}
                    uploadedDocuments={documents}
                    hasCoborrower={loan.has_coborrower || false}
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
                  <h3><ArrowUpFromLine size={18} className="inline-icon" /> Documents envoyés</h3>
                  <div className="documents-actions">
                    {(isAdmin || isAgent) && loan && id && (
                      <DownloadAllDocuments loanId={id} loanRef={loan.id.slice(0, 8)} />
                    )}
                    {(isAdmin || isAgent) && documents.length > 0 && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setShowBulkStatusModal(true)}
                      >
                        <ListChecks size={14} className="btn-icon" /> Traiter en masse
                      </Button>
                    )}
                    {(isAdmin || isAgent) && loan && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => setShowAdminUploadModal(true)}
                      >
                        <ArrowDownToLine size={14} className="btn-icon" /> Envoyer au client
                      </Button>
                    )}
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowUploadSection(!showUploadSection)}
                    >
                      {showUploadSection ? <><X size={14} className="btn-icon" /> Fermer</> : <><Plus size={14} className="btn-icon" /> Ajouter un document</>}
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
                      <User size={14} className="inline-icon" /> Emprunteur ({documents.filter(d => !d.document_owner || d.document_owner === 'primary').length})
                    </button>
                    <button 
                      className={`doc-owner-tab ${activeDocOwner === 'co_borrower' ? 'active' : ''}`}
                      onClick={() => setActiveDocOwner('co_borrower')}
                    >
                      <Users size={14} className="inline-icon" /> Co-emprunteur ({documents.filter(d => d.document_owner === 'co_borrower').length})
                      
                    </button>
                  </div>
                )}

                {documents.length === 0 && !showUploadSection ? (
                  <div className="empty-docs">
                    <FileStack size={48} className="empty-icon-lucide" />
                    <p>Aucun document envoyé dans ce dossier</p>
                    <Button variant="primary" size="sm" onClick={() => setShowUploadSection(true)}>
                      <Plus size={14} className="btn-icon" /> Ajouter un document
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
                          <div className="doc-icon"><FileText size={20} /></div>
                          <div className="doc-info">
                            <span className="doc-name">{doc.file_name}</span>
                            <span className="doc-meta">
                              {doc.category} • {formatDate(doc.uploaded_at)}
                              {loan?.has_coborrower && (
                                <span className="doc-owner-badge">
                                  {doc.document_owner === 'co_borrower' ? <> • <Users size={12} className="inline-icon" /> Co-emprunteur</> : <> • <User size={12} className="inline-icon" /> Emprunteur</>}
                                </span>
                              )}
                            </span>
                            {doc.status === 'rejected' && doc.rejection_reason && (
                              <span className="doc-rejection-reason">
                                <XCircle size={12} className="inline-icon reject-icon" /> {doc.rejection_reason}
                              </span>
                            )}
                          </div>
                          <StatusBadge status={doc.status} size="sm" />
                          {doc.status === 'rejected' && (
                            <ReplaceDocumentButton
                              documentId={doc.id}
                              documentCategory={doc.category || 'other'}
                              loanId={id}
                              documentOwner={doc.document_owner as 'primary' | 'co_borrower' | undefined}
                              onSuccess={loadLoanData}
                            />
                          )}
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

              {/* Bulk Document Status Modal */}
              {(isAdmin || isAgent) && (
                <BulkDocumentStatusModal
                  isOpen={showBulkStatusModal}
                  onClose={() => setShowBulkStatusModal(false)}
                  onSuccess={loadLoanData}
                  documents={documents}
                  clientName={clientProfile ? `${clientProfile.first_name || ''} ${clientProfile.last_name || ''}` : 'le client'}
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
                    <MessageCircle size={48} className="empty-icon-lucide" />
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
                        <span className="timeline-icon"><TimelineIcon name={event.icon} /></span>
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

              {/* Detailed History - Visible to agents/admins */}
              {(isAgent || isAdmin) && id && (
                <Card padding="lg" className="mt-4">
                  <h3>Historique détaillé</h3>
                  <div className="space-y-4 mt-4">
                    <LoanStatusHistory loanId={id} />
                    <DocumentStatusHistory documents={documents} />
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && loan && (
            <div className="tab-content fade-in">
              <Card padding="lg">
                <h3><Calculator size={18} className="inline-icon" /> Tableau d'amortissement</h3>
                <AmortizationSchedule
                  loanAmount={loan.amount}
                  interestRate={loan.rate}
                  durationMonths={loan.duration * 12}
                  monthlyPayment={loan.monthly_payment || 0}
                  insuranceRate={0.31}
                />
              </Card>

              {/* Book appointment button for clients */}
              {!isAgent && !isAdmin && assignedAgent && (
                <Card padding="lg" className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3><Calendar size={18} className="inline-icon" /> Prendre rendez-vous</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Réservez un créneau avec votre conseiller pour discuter de votre dossier.
                      </p>
                    </div>
                    <Button variant="primary" onClick={() => setShowAppointmentModal(true)}>
                      <Calendar size={16} className="mr-2" />
                      Réserver
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Appointment Booking Modal */}
        {showAppointmentModal && assignedAgent && (
          <AppointmentBooking
            agentId={assignedAgent.id}
            onClose={() => setShowAppointmentModal(false)}
            onSuccess={() => toast.success('Rendez-vous réservé avec succès !')}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default LoanDetail;
