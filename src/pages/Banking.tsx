import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import { bankingApi, beneficiariesApi, transfersApi, formatCurrency, formatDateTime } from '@/services/api';
import type { BankAccount, Beneficiary, Transaction } from '@/services/api';
import { useToast } from '@/components/finom/Toast';
import { isValidIBAN, isValidBIC } from '@/lib/validators';

const Banking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'beneficiaries' | 'transfers'>('overview');
  
  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [transferData, setTransferData] = useState({ beneficiaryId: '', amount: 0, reference: '' });
  const [beneficiaryData, setBeneficiaryData] = useState({ name: '', iban: '', bic: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [accountData, beneficiariesData] = await Promise.all([
        bankingApi.getAccount(user.id),
        beneficiariesApi.getAll(user.id)
      ]);
      setAccount(accountData);
      setBeneficiaries(beneficiariesData || []);
      if (accountData) {
        const txData = await bankingApi.getTransactions(accountData.id);
        setTransactions(txData || []);
      }
    } catch (err) {
      // Silent fail for banking load - UI shows empty state
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    if (!user || !transferData.beneficiaryId || transferData.amount <= 0) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    // Validate amount against balance
    if (account && transferData.amount > (account.balance || 0)) {
      toast.error('Solde insuffisant pour ce virement');
      return;
    }
    
    // Validate minimum amount
    if (transferData.amount < 1) {
      toast.error('Le montant minimum est de 1 €');
      return;
    }
    
    // Validate maximum amount (safety limit)
    if (transferData.amount > 100000) {
      toast.error('Le montant maximum par virement est de 100 000 €');
      return;
    }
    
    try {
      setSubmitting(true);
      await transfersApi.create({
        user_id: user.id,
        beneficiary_id: transferData.beneficiaryId,
        amount: transferData.amount,
        reference: transferData.reference || undefined
      });
      toast.success('Virement initié avec succès');
      setShowTransferModal(false);
      setTransferData({ beneficiaryId: '', amount: 0, reference: '' });
      loadData();
    } catch (err) {
      toast.error('Erreur lors du virement');
    } finally {
      setSubmitting(false);
    }
  };

  // IBAN validation is now imported from @/lib/validators

  const handleCreateBeneficiary = async () => {
    if (!user || !beneficiaryData.name || !beneficiaryData.iban) {
      toast.error('Veuillez remplir le nom et l\'IBAN');
      return;
    }
    
    // Validate name length
    if (beneficiaryData.name.trim().length < 2) {
      toast.error('Le nom doit contenir au moins 2 caractères');
      return;
    }
    
    // Validate IBAN format
    if (!isValidIBAN(beneficiaryData.iban)) {
      toast.error('Format IBAN invalide');
      return;
    }
    
    try {
      setSubmitting(true);
      await beneficiariesApi.create({
        user_id: user.id,
        name: beneficiaryData.name.trim(),
        iban: beneficiaryData.iban.replace(/\s/g, '').toUpperCase(),
        bic: beneficiaryData.bic?.toUpperCase() || undefined
      });
      toast.success('Bénéficiaire ajouté');
      setShowBeneficiaryModal(false);
      setBeneficiaryData({ name: '', iban: '', bic: '' });
      loadData();
    } catch (err) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="banking-page">
        <div className="page-header">
          <div className="container">
            <h1>Mon compte bancaire</h1>
            <p>Gérez vos virements et bénéficiaires</p>
          </div>
        </div>

        <div className="container">
          {/* Balance Card */}
          <Card className="balance-card fade-in" padding="xl">
            <div className="balance-content">
              <span className="balance-label">Solde disponible</span>
              <span className="balance-amount">{formatCurrency(account?.balance || 0)}</span>
              <span className="account-iban">{account?.iban || 'Aucun compte associé'}</span>
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setShowTransferModal(true)} 
              disabled={!account || beneficiaries.length === 0 || (account.balance || 0) <= 0}
            >
              + Nouveau virement
            </Button>
          </Card>

          {!account && (
            <Card className="warning-card fade-in" padding="md">
              <p className="warning-card-text">
                ⚠️ Vous n'avez pas encore de compte bancaire associé. Contactez le support pour en créer un.
              </p>
            </Card>
          )}

          {/* Tabs */}
          <div className="tabs fade-in">
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Transactions</button>
            <button className={`tab ${activeTab === 'beneficiaries' ? 'active' : ''}`} onClick={() => setActiveTab('beneficiaries')}>Bénéficiaires ({beneficiaries.length})</button>
          </div>

          {activeTab === 'overview' && (
            <Card className="transactions-card fade-in" padding="lg">
              <h3>Dernières transactions</h3>
              {transactions.length === 0 ? (
                <p className="empty-text">Aucune transaction</p>
              ) : (
                <div className="transactions-list">
                  {transactions.slice(0, 10).map(tx => (
                    <div key={tx.id} className="transaction-item">
                      <div className="tx-info">
                        <span className="tx-label">{tx.label || tx.type}</span>
                        <span className="tx-date">{formatDateTime(tx.created_at)}</span>
                      </div>
                      <span className={`tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'beneficiaries' && (
            <Card className="beneficiaries-card fade-in" padding="lg">
              <div className="card-header">
                <h3>Mes bénéficiaires</h3>
                <Button variant="secondary" size="sm" onClick={() => setShowBeneficiaryModal(true)}>+ Ajouter</Button>
              </div>
              {beneficiaries.length === 0 ? (
                <p className="empty-text">Aucun bénéficiaire enregistré</p>
              ) : (
                <div className="beneficiaries-list">
                  {beneficiaries.map(b => (
                    <div key={b.id} className="beneficiary-item">
                      <div className="b-info">
                        <span className="b-name">{b.name}</span>
                        <span className="b-iban">{b.iban}</span>
                      </div>
                      <StatusBadge status={b.status} size="sm" />
                      <button 
                        className="delete-btn"
                        onClick={async () => {
                          if (confirm(`Supprimer ${b.name} ?`)) {
                            try {
                              await beneficiariesApi.delete(b.id);
                              toast.success('Bénéficiaire supprimé');
                              loadData();
                            } catch (err) {
                              toast.error('Erreur lors de la suppression');
                            }
                          }
                        }}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Nouveau virement</h3>
              <div className="form-group">
                <label>Bénéficiaire</label>
                <select 
                  value={transferData.beneficiaryId} 
                  onChange={e => setTransferData(prev => ({ ...prev, beneficiaryId: e.target.value }))}
                >
                  <option value="">Sélectionner...</option>
                  {beneficiaries.map(b => (
                    <option key={b.id} value={b.id}>{b.name} - {b.iban}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Montant (€)</label>
                <input 
                  type="number" 
                  value={transferData.amount || ''} 
                  onChange={e => setTransferData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  min={1}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Référence (optionnel)</label>
                <input 
                  type="text" 
                  value={transferData.reference} 
                  onChange={e => setTransferData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Motif du virement"
                />
              </div>
              <div className="modal-actions">
                <Button variant="ghost" onClick={() => setShowTransferModal(false)}>Annuler</Button>
                <Button variant="primary" onClick={handleCreateTransfer} disabled={submitting}>
                  {submitting ? 'Envoi...' : 'Confirmer le virement'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Beneficiary Modal */}
        {showBeneficiaryModal && (
          <div className="modal-overlay" onClick={() => setShowBeneficiaryModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Ajouter un bénéficiaire</h3>
              <div className="form-group">
                <label>Nom du bénéficiaire</label>
                <input 
                  type="text" 
                  value={beneficiaryData.name} 
                  onChange={e => setBeneficiaryData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom complet"
                />
              </div>
              <div className="form-group">
                <label>IBAN</label>
                <input 
                  type="text" 
                  value={beneficiaryData.iban} 
                  onChange={e => setBeneficiaryData(prev => ({ ...prev, iban: e.target.value }))}
                  placeholder="FR76..."
                />
              </div>
              <div className="form-group">
                <label>BIC (optionnel)</label>
                <input 
                  type="text" 
                  value={beneficiaryData.bic} 
                  onChange={e => setBeneficiaryData(prev => ({ ...prev, bic: e.target.value }))}
                  placeholder="BNPAFRPP"
                />
              </div>
              <div className="modal-actions">
                <Button variant="ghost" onClick={() => setShowBeneficiaryModal(false)}>Annuler</Button>
                <Button variant="primary" onClick={handleCreateBeneficiary} disabled={submitting}>
                  {submitting ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
};

export default Banking;
