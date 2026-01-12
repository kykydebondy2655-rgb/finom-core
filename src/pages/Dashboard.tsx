import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { loansApi, formatCurrency, formatDate, getStatusLabel, getStatusColor, LoanApplication } from '../services/api';
import logger from '../lib/logger';

const Dashboard = () => {
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
            logger.logError('Failed to load loans', error);
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
                                    {loans.slice(0, 5).map((loan: LoanApplication) => (
                                        <tr
                                            key={loan.id}
                                            onClick={() => navigate(`/loans/${loan.id}`)}
                                            className="loan-row"
                                        >
                                            <td><span className="ref-badge">#{loan.id.slice(0, 8)}</span></td>
                                            <td className="amount">{formatCurrency(loan.amount)}</td>
                                            <td>{formatCurrency(loan.monthly_payment || loan.monthly_payment_est || 0)}/mois</td>
                                            <td><span className="status-badge" data-status={loan.status} style={{ backgroundColor: getStatusColor(loan.status) }}>{getStatusLabel(loan.status)}</span></td>
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

            </div>
        </PageLayout>
    );
};

export default Dashboard;
