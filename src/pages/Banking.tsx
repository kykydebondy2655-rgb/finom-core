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

const Banking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'beneficiaries' | 'transfers'>('overview');

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
      console.error('Error loading banking data:', err);
    } finally {
      setLoading(false);
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
              <span className="account-iban">{account?.iban || 'Aucun compte'}</span>
            </div>
            <Button variant="primary" size="lg">+ Nouveau virement</Button>
          </Card>

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
                <Button variant="secondary" size="sm">+ Ajouter</Button>
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
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        <style>{`
          .banking-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 100%); color: white; padding: 3rem 1.5rem; margin-bottom: 2rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
          .container { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }
          .balance-card { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: linear-gradient(135deg, #1e3a5f 0%, var(--color-secondary) 100%); color: white; }
          .balance-label { font-size: 0.9rem; opacity: 0.8; }
          .balance-amount { font-size: 2.5rem; font-weight: 700; display: block; margin: 0.5rem 0; }
          .account-iban { font-family: monospace; font-size: 0.85rem; opacity: 0.7; }
          .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
          .tab { padding: 0.75rem 1.5rem; border: none; background: white; border-radius: var(--radius-full); font-weight: 600; color: var(--color-text-secondary); cursor: pointer; }
          .tab.active { background: var(--color-primary); color: white; }
          .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
          .card-header h3 { margin: 0; }
          .empty-text { color: var(--color-text-tertiary); text-align: center; padding: 2rem; }
          .transactions-list, .beneficiaries-list { display: flex; flex-direction: column; gap: 0.5rem; }
          .transaction-item, .beneficiary-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: var(--radius-md); }
          .tx-label, .b-name { font-weight: 600; }
          .tx-date, .b-iban { font-size: 0.8rem; color: var(--color-text-tertiary); }
          .tx-amount { font-weight: 700; }
          .tx-amount.positive { color: var(--color-success); }
          .tx-amount.negative { color: var(--color-danger); }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default Banking;
