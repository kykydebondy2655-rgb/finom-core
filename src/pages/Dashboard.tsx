import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  motion, 
  fadeInUp, 
  staggerContainer 
} from '@/components/animations';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/finom/Card';
import Button from '../components/finom/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { loansApi, formatCurrency, formatDate, getStatusLabel, getStatusColor, LoanApplication } from '../services/api';
import logger from '../lib/logger';
import { BarChart3, FileText, FolderOpen, Landmark, User, Calculator } from 'lucide-react';

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
                <motion.div 
                    className="page-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="page-header-content">
                        <h1>Bonjour, {user?.firstName || 'Utilisateur'}</h1>
                        <p>Bienvenue sur votre espace personnel FINOM. Gérez vos demandes de prêt et suivez vos dossiers en temps réel.</p>
                    </div>
                </motion.div>

                <div className="container">
                {/* Quick Actions */}
                <motion.div 
                    className="quick-actions"
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
                        <Button onClick={() => navigate('/simulator')} variant="primary" size="lg">
                            <Calculator size={18} style={{ marginRight: '8px' }} />
                            Nouvelle simulation
                        </Button>
                    </motion.div>
                    <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
                        <Button onClick={() => navigate('/loans/new')} variant="secondary" size="lg">
                            <FileText size={18} style={{ marginRight: '8px' }} />
                            Nouvelle demande
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Recent Loans Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="loans-card" padding="xl">
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
                            <motion.div 
                                className="empty-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="empty-icon">
                                    <FolderOpen size={48} />
                                </div>
                                <h3>Aucune demande de prêt</h3>
                                <p>Commencez par une simulation gratuite pour estimer votre capacité d'emprunt.</p>
                                <Button onClick={() => navigate('/simulator')} variant="primary" size="md">
                                    Faire une simulation
                                </Button>
                            </motion.div>
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
                                        {loans.slice(0, 5).map((loan: LoanApplication, index: number) => (
                                            <motion.tr
                                                key={loan.id}
                                                onClick={() => navigate(`/loans/${loan.id}`)}
                                                className="loan-row"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
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
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Banking Quick Access */}
                <motion.div 
                    className="banking-cards"
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
                        <Card className="banking-card" padding="lg" onClick={() => navigate('/banking')}>
                            <motion.div 
                                className="banking-icon"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Landmark size={28} />
                            </motion.div>
                            <div className="banking-info">
                                <h4>Compte bancaire</h4>
                                <p>Consulter mon solde et transactions</p>
                            </div>
                            <span className="arrow">→</span>
                        </Card>
                    </motion.div>
                    <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
                        <Card className="banking-card" padding="lg" onClick={() => navigate('/loans')}>
                            <motion.div 
                                className="banking-icon"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <FileText size={28} />
                            </motion.div>
                            <div className="banking-info">
                                <h4>Mes dossiers</h4>
                                <p>Gérer mes demandes de prêt</p>
                            </div>
                            <span className="arrow">→</span>
                        </Card>
                    </motion.div>
                    <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
                        <Card className="banking-card" padding="lg" onClick={() => navigate('/profile')}>
                            <motion.div 
                                className="banking-icon"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <User size={28} />
                            </motion.div>
                            <div className="banking-info">
                                <h4>Mon profil</h4>
                                <p>Informations personnelles</p>
                            </div>
                            <span className="arrow">→</span>
                        </Card>
                    </motion.div>
                </motion.div>
                </div>

            </div>
        </PageLayout>
    );
};

export default Dashboard;
