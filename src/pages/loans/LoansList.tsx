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

        <style>{`
          .loans-page {
            min-height: 100vh;
            background: var(--color-bg);
            padding-bottom: 4rem;
          }

          .page-header {
            background: linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 100%);
            color: white;
            padding: 3rem 1.5rem;
            margin-bottom: 2rem;
          }

          .page-header h1 {
            color: white;
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .page-header p {
            opacity: 0.9;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
          }

          .loans-actions {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .loans-card {
            margin-bottom: 2rem;
          }

          .error-state {
            text-align: center;
            padding: 2rem;
            color: var(--color-danger);
          }

          .loans-table-wrapper {
            overflow-x: auto;
          }

          .loans-table {
            width: 100%;
            border-collapse: collapse;
          }

          .loans-table th {
            text-align: left;
            padding: 1rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-text-tertiary);
            font-weight: 600;
            border-bottom: 1px solid var(--color-border);
          }

          .loans-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--color-border);
            vertical-align: middle;
          }

          .loan-row {
            cursor: pointer;
            transition: background-color 0.15s;
          }

          .loan-row:hover {
            background-color: #f8fafc;
          }

          .ref-badge {
            background: #f1f5f9;
            padding: 0.25rem 0.5rem;
            border-radius: var(--radius-sm);
            font-weight: 600;
            font-size: 0.85rem;
            color: var(--color-primary);
            font-family: monospace;
          }

          .amount {
            font-weight: 600;
            color: var(--color-text);
          }

          .date {
            color: var(--color-text-tertiary);
            font-size: 0.9rem;
          }

          @media (max-width: 768px) {
            .loans-actions {
              flex-direction: column;
            }
          }

          .fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default LoansList;
