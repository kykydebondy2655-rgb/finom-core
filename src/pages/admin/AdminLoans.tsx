import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import LoanStatusModal from '@/components/admin/LoanStatusModal';
import { adminApi, formatCurrency, formatDate } from '@/services/api';

const AdminLoans: React.FC = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllLoans();
      setLoans(data || []);
    } catch (err) {
      console.error('Error loading loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (loan: any) => {
    setSelectedLoan(loan);
    setShowStatusModal(true);
  };

  const filteredLoans = loans.filter(l => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const statusCounts = {
    all: loans.length,
    pending: loans.filter(l => l.status === 'pending').length,
    documents_required: loans.filter(l => l.status === 'documents_required').length,
    in_review: loans.filter(l => l.status === 'in_review').length,
    approved: loans.filter(l => l.status === 'approved').length,
    funded: loans.filter(l => l.status === 'funded').length,
    rejected: loans.filter(l => l.status === 'rejected').length,
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-loans-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <h1>Gestion des dossiers</h1>
            <p>{loans.length} dossiers • {formatCurrency(loans.reduce((s, l) => s + (l.amount || 0), 0))} total</p>
          </div>
        </div>

        <div className="container">
          {/* Filters */}
          <div className="filters fade-in">
              {Object.entries(statusCounts).map(([key, count]) => {
                const labelMap: Record<string, string> = {
                  all: 'Tous',
                  pending: 'En attente',
                  documents_required: 'Docs requis',
                  in_review: 'En analyse',
                  approved: 'Approuvé',
                  funded: 'Financé',
                  rejected: 'Refusé',
                };
                return (
                  <button 
                    key={key}
                    className={`filter-btn ${filter === key ? 'active' : ''}`}
                    onClick={() => setFilter(key)}
                  >
                    {labelMap[key] || key} ({count})
                  </button>
                );
              })}
          </div>

          <Card className="loans-card fade-in" padding="lg">
            {filteredLoans.length === 0 ? (
              <p className="empty-text">Aucun dossier trouvé</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Client</th>
                      <th>Montant</th>
                      <th>Durée</th>
                      <th>Taux</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoans.map(loan => (
                      <tr key={loan.id} onClick={() => navigate(`/loans/${loan.id}`)}>
                        <td><span className="ref-badge">#{loan.id.slice(0, 8)}</span></td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">{loan.user?.first_name?.[0] || 'C'}</div>
                            <span>{loan.user?.first_name} {loan.user?.last_name}</span>
                          </div>
                        </td>
                        <td className="amount">{formatCurrency(loan.amount)}</td>
                        <td>{loan.duration} ans</td>
                        <td>{loan.rate}%</td>
                        <td><StatusBadge status={loan.status} size="sm" /></td>
                        <td className="date">{formatDate(loan.created_at)}</td>
                        <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                          <Button variant="secondary" size="sm" onClick={() => handleEditStatus(loan)}>
                            ✏️ Statut
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/loans/${loan.id}`)}>
                            Voir →
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <LoanStatusModal
            isOpen={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedLoan(null);
            }}
            onSuccess={loadLoans}
            loan={selectedLoan}
          />
        </div>

        <style>{`
          .admin-loans-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-admin) 0%, #5b21b6 100%); color: white; padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.25rem; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
          .filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
          .filter-btn { padding: 0.625rem 1rem; border: none; background: white; border-radius: var(--radius-full); font-weight: 600; font-size: 0.85rem; color: var(--color-text-secondary); cursor: pointer; }
          .filter-btn:hover { background: #f1f5f9; }
          .filter-btn.active { background: var(--color-admin); color: white; }
          .table-wrapper { overflow-x: auto; }
          .data-table { width: 100%; border-collapse: collapse; }
          .data-table th { text-align: left; padding: 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border); }
          .data-table td { padding: 1rem; border-bottom: 1px solid var(--color-border); }
          .data-table tbody tr { cursor: pointer; transition: background 0.15s; }
          .data-table tbody tr:hover { background: #f8fafc; }
          .ref-badge { background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.8rem; color: var(--color-admin); font-family: monospace; }
          .user-cell { display: flex; align-items: center; gap: 0.75rem; }
          .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; }
          .amount { font-weight: 600; }
          .date { color: var(--color-text-tertiary); font-size: 0.9rem; }
          .actions-cell { display: flex; gap: 0.5rem; }
          .empty-text { text-align: center; color: var(--color-text-tertiary); padding: 3rem; }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminLoans;
