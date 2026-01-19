import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import LoanStatusModal from '@/components/admin/LoanStatusModal';
import { adminApi, formatCurrency, formatDate, type LoanApplication, type Profile } from '@/services/api';
import logger from '@/lib/logger';

interface LoanWithUser extends LoanApplication {
  user?: Profile | null;
}

const AdminLoans: React.FC = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<LoanWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithUser | null>(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllLoans();
      setLoans(data || []);
    } catch (err) {
      logger.logError('Error loading loans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (loan: LoanWithUser) => {
    setSelectedLoan(loan);
    setShowStatusModal(true);
  };

  const filteredLoans = loans.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'under_review') return l.status === 'in_review' || l.status === 'under_review';
    return l.status === filter;
  });

  const statusCounts = {
    all: loans.length,
    pending: loans.filter(l => l.status === 'pending').length,
    documents_required: loans.filter(l => l.status === 'documents_required').length,
    under_review: loans.filter(l => l.status === 'in_review' || l.status === 'under_review').length,
    processing: loans.filter(l => l.status === 'processing').length,
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
                  under_review: 'En analyse',
                  processing: 'En traitement',
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
                      <th>Co-empr.</th>
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
                        <td>
                          {loan.has_coborrower ? (
                            <span className="coborrower-badge" title="Dossier avec co-emprunteur">👥</span>
                          ) : (
                            <span className="no-coborrower">—</span>
                          )}
                        </td>
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
      </div>
    </PageLayout>
  );
};

export default AdminLoans;
