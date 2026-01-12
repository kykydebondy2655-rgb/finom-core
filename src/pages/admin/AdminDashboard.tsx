import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { adminApi, formatCurrency } from '@/services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, agents: 0, loans: 0, pendingLoans: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [clients, agents, loans] = await Promise.all([
        adminApi.getAllClients(),
        adminApi.getAllAgents(),
        adminApi.getAllLoans()
      ]);
      
      setStats({
        clients: clients?.length || 0,
        agents: agents?.length || 0,
        loans: loans?.length || 0,
        pendingLoans: loans?.filter((l: any) => l.status === 'pending').length || 0,
        totalAmount: loans?.reduce((sum: number, l: any) => sum + (l.down_payment || 0), 0) || 0
      });
    } catch (err) {
      // Silent fail for stats - non-blocking
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-dashboard">
        <div className="page-header">
          <div className="container">
            <h1>Administration FINOM</h1>
            <p>Bienvenue, {user?.firstName || 'Admin'}</p>
          </div>
        </div>

        <div className="container">
          {/* Stats Grid */}
          <div className="stats-grid fade-in">
            <Card className="stat-card" padding="lg" onClick={() => navigate('/admin/clients')}>
              <span className="stat-icon">👥</span>
              <span className="stat-value">{stats.clients}</span>
              <span className="stat-label">Clients</span>
            </Card>
            <Card className="stat-card" padding="lg" onClick={() => navigate('/admin/agents')}>
              <span className="stat-icon">🧑‍💼</span>
              <span className="stat-value">{stats.agents}</span>
              <span className="stat-label">Agents</span>
            </Card>
            <Card className="stat-card" padding="lg" onClick={() => navigate('/admin/loans')}>
              <span className="stat-icon">📋</span>
              <span className="stat-value">{stats.loans}</span>
              <span className="stat-label">Dossiers</span>
            </Card>
            <Card className="stat-card highlight" padding="lg">
              <span className="stat-icon">⏳</span>
              <span className="stat-value">{stats.pendingLoans}</span>
              <span className="stat-label">En attente</span>
            </Card>
            <Card className="stat-card wide" padding="lg">
              <span className="stat-icon">💰</span>
              <span className="stat-value">{formatCurrency(stats.totalAmount)}</span>
              <span className="stat-label">Apports encaissés</span>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions fade-in">
            <h3>Actions rapides</h3>
            <div className="actions-grid">
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/clients')}>
                <span className="action-icon">👥</span>
                <span className="action-label">Gérer les clients</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/agents')}>
                <span className="action-icon">🧑‍💼</span>
                <span className="action-label">Gérer les agents</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/loans')}>
                <span className="action-icon">📋</span>
                <span className="action-label">Voir les dossiers</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/assignments')}>
                <span className="action-icon">🔗</span>
                <span className="action-label">Assignations</span>
              </Card>
            </div>
          </div>
        </div>

        <style>{`
          .admin-dashboard { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-admin) 0%, #5b21b6 100%); color: white; padding: 3rem 1.5rem; margin-bottom: 2rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
          .stat-card { text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
          .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
          .stat-card.highlight { background: linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%); color: white; }
          .stat-card.highlight .stat-value { color: white; }
          .stat-card.wide { grid-column: span 2; }
          .stat-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
          .stat-value { font-size: 2.5rem; font-weight: 700; color: var(--color-admin); display: block; }
          .stat-label { font-size: 0.9rem; color: var(--color-text-secondary); }
          .stat-card.highlight .stat-label { color: rgba(255,255,255,0.9); }
          .quick-actions h3 { margin-bottom: 1.5rem; }
          .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
          .action-card { text-align: center; cursor: pointer; transition: transform 0.2s; }
          .action-card:hover { transform: translateY(-2px); }
          .action-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
          .action-label { font-weight: 600; color: var(--color-text); }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 1024px) { .stats-grid, .actions-grid { grid-template-columns: repeat(2, 1fr); } .stat-card.wide { grid-column: span 2; } }
          @media (max-width: 640px) { .stats-grid, .actions-grid { grid-template-columns: 1fr; } .stat-card.wide { grid-column: span 1; } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
