import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import StatusBadge from '@/components/common/StatusBadge';
import { loansApi, formatCurrency, formatDate } from '@/services/api';
import type { LoanApplication } from '@/services/api';

const LoansList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLoans();
  }, [user]);

  const loadLoans = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await loansApi.getByUser(user.id);
      setLoans(data || []);
    } catch (err) {
      // Log silently - error state handles UI feedback
      setError('Impossible de charger vos dossiers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="loans-page">
        <div className="page-header">
          <div className="container">
            <h1>Mes demandes de prêt</h1>
            <p>Suivez l'avancement de vos dossiers en temps réel</p>
          </div>
        </div>

        <div className="container">
          <div className="loans-actions fade-in">
            <Button variant="primary" size="lg" onClick={() => navigate('/loans/new')}>
              + Nouvelle demande
            </Button>
            <Button variant="ghost" size="md" onClick={() => navigate('/simulator')}>
              📊 Faire une simulation
            </Button>
          </div>

          <Card className="loans-card fade-in" padding="xl">
            {loading ? (
              <LoadingSpinner message="Chargement de vos dossiers..." />
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <Button variant="secondary" onClick={loadLoans}>Réessayer</Button>
              </div>
            ) : loans.length === 0 ? (
              <EmptyState
                icon="📁"
                title="Aucune demande de prêt"
                description="Commencez par une simulation gratuite pour estimer votre capacité d'emprunt, puis créez votre première demande."
                actionLabel="Créer ma première demande"
                onAction={() => navigate('/loans/new')}
              />
            ) : (
              <div className="loans-table-wrapper">
                <table className="loans-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Montant</th>
                      <th>Durée</th>
                      <th>Mensualité</th>
                      <th>Statut</th>
                      <th>Dernière MAJ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map(loan => (
                      <tr 
                        key={loan.id} 
                        onClick={() => navigate(`/loans/${loan.id}`)}
                        className="loan-row"
                      >
                        <td>
                          <span className="ref-badge">#{loan.id.slice(0, 8)}</span>
                        </td>
                        <td className="amount">{formatCurrency(loan.amount)}</td>
                        <td>{loan.duration} ans</td>
                        <td>{formatCurrency(loan.monthly_payment)}/mois</td>
                        <td><StatusBadge status={loan.status} /></td>
                        <td className="date">{formatDate(loan.updated_at)}</td>
                        <td>
                          <Button variant="ghost" size="sm">Voir →</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

      </div>
    </PageLayout>
  );
};

export default LoansList;
