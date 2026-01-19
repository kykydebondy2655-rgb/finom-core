import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LoanStatsChart } from '@/components/charts/LoanStatsChart';
import { adminApi, formatCurrency } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserCheck, 
  FileText, 
  Clock, 
  Wallet,
  Link2,
  History,
  ClipboardList,
  Upload,
  Settings
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, agents: 0, loans: 0, pendingLoans: 0, totalAmount: 0 });
  const [loansByStatus, setLoansByStatus] = useState<{ status: string; count: number }[]>([]);
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

      // Group loans by status for chart
      const statusCounts: Record<string, number> = {};
      loans?.forEach((l: any) => {
        statusCounts[l.status || 'pending'] = (statusCounts[l.status || 'pending'] || 0) + 1;
      });
      setLoansByStatus(Object.entries(statusCounts).map(([status, count]) => ({ status, count })));

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
              <span className="stat-icon"><Users size={24} /></span>
              <span className="stat-value">{stats.clients}</span>
              <span className="stat-label">Clients</span>
            </Card>
            <Card className="stat-card" padding="lg" onClick={() => navigate('/admin/agents')}>
              <span className="stat-icon"><UserCheck size={24} /></span>
              <span className="stat-value">{stats.agents}</span>
              <span className="stat-label">Agents</span>
            </Card>
            <Card className="stat-card" padding="lg" onClick={() => navigate('/admin/loans')}>
              <span className="stat-icon"><FileText size={24} /></span>
              <span className="stat-value">{stats.loans}</span>
              <span className="stat-label">Dossiers</span>
            </Card>
            <Card className="stat-card highlight" padding="lg">
              <span className="stat-icon"><Clock size={24} /></span>
              <span className="stat-value">{stats.pendingLoans}</span>
              <span className="stat-label">En attente</span>
            </Card>
            <Card className="stat-card wide" padding="lg">
              <span className="stat-icon"><Wallet size={24} /></span>
              <span className="stat-value">{formatCurrency(stats.totalAmount)}</span>
              <span className="stat-label">Apports encaissés</span>
            </Card>
          </div>

          {/* Charts Section */}
          {loansByStatus.length > 0 && (
            <Card className="chart-card fade-in" padding="lg">
              <h3>Répartition des dossiers par statut</h3>
              <LoanStatsChart data={loansByStatus} type="bar" />
            </Card>
          )}

          {/* Quick Actions */}
          <div className="quick-actions fade-in">
            <h3>Actions rapides</h3>
            <div className="actions-grid">
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/clients')}>
                <span className="action-icon"><Users size={24} /></span>
                <span className="action-label">Gérer les clients</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/agents')}>
                <span className="action-icon"><UserCheck size={24} /></span>
                <span className="action-label">Gérer les agents</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/loans')}>
                <span className="action-icon"><FileText size={24} /></span>
                <span className="action-label">Voir les dossiers</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/assignments')}>
                <span className="action-icon"><Link2 size={24} /></span>
                <span className="action-label">Assignations</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/leads')}>
                <span className="action-icon"><ClipboardList size={24} /></span>
                <span className="action-label">Gérer les leads</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/imports')}>
                <span className="action-icon"><Upload size={24} /></span>
                <span className="action-label">Imports CSV</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/login-history')}>
                <span className="action-icon"><History size={24} /></span>
                <span className="action-label">Historique connexions</span>
              </Card>
              <Card className="action-card" padding="lg" onClick={() => navigate('/admin/settings')}>
                <span className="action-icon"><Settings size={24} /></span>
                <span className="action-label">Paramètres</span>
              </Card>
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
