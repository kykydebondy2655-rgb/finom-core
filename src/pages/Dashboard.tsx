import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { loansApi, formatCurrency, formatDate, getStatusLabel, getStatusColor, type LoanApplication } from '../services/api';
import { createLogger } from '../lib/logger';

const log = createLogger('Dashboard');

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loans, setLoans] = useState<LoanApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadLoans();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadLoans = async () => {
        try {
            const data = await loansApi.getByUser(user!.id);
            setLoans(data || []);
        } catch (error) {
            log.error('Failed to load loans:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <PageLayout>
            <div className="dashboard-page">
                {/* Page Header */}
                <div className="page-header">
                    <div className="page-header-content">
                        <h1>Bonjour, {user?.firstName || 'Utilisateur'}</h1>
                        <p>Bienvenue sur votre espace personnel FINOM. Gérez vos demandes de prêt et suivez vos dossiers en temps réel.</p>
                    </div>
                </div>

                <div className="container">
                {/* Quick Actions */}
                <div className="quick-actions fade-in">
                    <Button onClick={() => navigate('/simulator')} variant="primary" size="lg">
                        📊 Nouvelle simulation
                    </Button>
                    <Button onClick={() => navigate('/loans/new')} variant="secondary" size="lg">
                        📝 Nouvelle demande
                    </Button>
                </div>

                {/* Recent Loans Card */}
                <Card className="loans-card fade-in" padding="xl">
                    <div className="section-header">
                        <h2>Mes dossiers récents</h2>
                        <Link to="/loans" className="view-all">Voir tout →</Link>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Chargement de vos dossiers...</p>
                        </div>
                    ) : loans.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📁</div>
                            <h3>Aucune demande de prêt</h3>
                            <p>Commencez par une simulation gratuite pour estimer votre capacité d'emprunt.</p>
                            <Button onClick={() => navigate('/simulator')} variant="primary" size="md">
                                Faire une simulation
                            </Button>
                        </div>
                    ) : (
                        <div className="loans-table-wrapper">
                            <table className="loans-table">
                                <thead>
                                    <tr>
                                        <th>Référence</th>
                                        <th>Montant</th>
                                        <th>Mensualité</th>
                                        <th>Statut</th>
                                        <th>Mise à jour</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.slice(0, 5).map((loan) => (
                                        <tr
                                            key={loan.id}
                                            onClick={() => navigate(`/loans/${loan.id}`)}
                                            className="loan-row"
                                        >
                                            <td><span className="ref-badge">#{loan.id.slice(0, 8)}</span></td>
                                            <td className="amount">{formatCurrency(loan.amount)}</td>
                                            <td>{formatCurrency(loan.monthly_payment || loan.monthly_payment_est || 0)}/mois</td>
                                            <td><span className="status-badge" style={{ background: getStatusColor(loan.status) }}>{getStatusLabel(loan.status)}</span></td>
                                            <td className="date">{formatDate(loan.updated_at || loan.created_at)}</td>
                                            <td>
                                                <Button variant="ghost" size="sm">
                                                    Gérer →
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Banking Quick Access */}
                <div className="banking-cards fade-in">
                    <Card className="banking-card" padding="lg" onClick={() => navigate('/banking')}>
                        <div className="banking-icon">🏦</div>
                        <div className="banking-info">
                            <h4>Compte bancaire</h4>
                            <p>Consulter mon solde et transactions</p>
                        </div>
                        <span className="arrow">→</span>
                    </Card>
                    <Card className="banking-card" padding="lg" onClick={() => navigate('/loans')}>
                        <div className="banking-icon">📄</div>
                        <div className="banking-info">
                            <h4>Mes dossiers</h4>
                            <p>Gérer mes demandes de prêt</p>
                        </div>
                        <span className="arrow">→</span>
                    </Card>
                    <Card className="banking-card" padding="lg" onClick={() => navigate('/profile')}>
                        <div className="banking-icon">👤</div>
                        <div className="banking-info">
                            <h4>Mon profil</h4>
                            <p>Informations personnelles</p>
                        </div>
                        <span className="arrow">→</span>
                    </Card>
                </div>
                </div>

                <style>{`
                .dashboard-page {
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
                
                .page-header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .page-header h1 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                
                .page-header p {
                    opacity: 0.9;
                    max-width: 600px;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .quick-actions {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .loans-card {
                    margin-bottom: 2rem;
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .section-header h2 {
                    font-size: 1.25rem;
                    color: var(--color-text);
                    margin: 0;
                }
                
                .view-all {
                    color: var(--color-primary);
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-decoration: none;
                }
                
                .view-all:hover {
                    text-decoration: underline;
                }

                .loading-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--color-text-tertiary);
                }
                
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--color-border);
                    border-top-color: var(--color-primary);
                    border-radius: 50%;
                    margin: 0 auto 1rem;
                    animation: spin 0.8s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                }
                
                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                
                .empty-state h3 {
                    margin-bottom: 0.5rem;
                    color: var(--color-text);
                }
                
                .empty-state p {
                    color: var(--color-text-secondary);
                    margin-bottom: 1.5rem;
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
                }
                
                .amount {
                    font-weight: 600;
                    color: var(--color-text);
                }
                
                .date {
                    color: var(--color-text-tertiary);
                    font-size: 0.9rem;
                }

                .banking-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .banking-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .banking-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }
                
                .banking-icon {
                    font-size: 2rem;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    border-radius: var(--radius-md);
                }
                
                .banking-info {
                    flex: 1;
                }
                
                .banking-info h4 {
                    margin: 0 0 0.25rem;
                    font-size: 1rem;
                    color: var(--color-text);
                }
                
                .banking-info p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                }
                
                .arrow {
                    color: var(--color-text-tertiary);
                    font-size: 1.25rem;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                }

                @media (max-width: 768px) {
                    .banking-cards {
                        grid-template-columns: 1fr;
                    }
                    .quick-actions {
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

export default Dashboard;
