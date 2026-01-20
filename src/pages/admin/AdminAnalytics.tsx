import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LoanStatsChart } from '@/components/charts/LoanStatsChart';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/services/api';
import { logger } from '@/lib/logger';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserCheck, 
  FileText, 
  Phone,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart
} from 'lucide-react';

interface AgentStats {
  id: string;
  name: string;
  email: string;
  clientsAssigned: number;
  callsMade: number;
  callbacksCompleted: number;
  callbacksPending: number;
  conversionRate: number;
}

interface LeadFunnelStats {
  new: number;
  assigned: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
}

interface OverviewStats {
  totalLeads: number;
  totalClients: number;
  totalAgents: number;
  totalLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  pendingLoans: number;
  totalLoanAmount: number;
  avgProcessingDays: number;
  conversionRate: number;
}

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [leadFunnel, setLeadFunnel] = useState<LeadFunnelStats | null>(null);
  const [loansByStatus, setLoansByStatus] = useState<{ status: string; count: number }[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{ month: string; loans: number; amount: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        profilesData,
        loansData,
        assignmentsData,
        callLogsData,
        callbacksData,
      ] = await Promise.all([
        supabase.from('profiles').select('id, role, lead_status, pipeline_stage, created_at'),
        supabase.from('loan_applications').select('id, status, amount, created_at, updated_at, user_id'),
        supabase.from('client_assignments').select('id, agent_user_id, client_user_id, assigned_at'),
        supabase.from('call_logs').select('id, agent_id, client_id, call_status, created_at'),
        supabase.from('callbacks').select('id, agent_id, status, scheduled_at, completed_at'),
      ]);

      const profiles = profilesData.data || [];
      const loans = loansData.data || [];
      const assignments = assignmentsData.data || [];
      const callLogs = callLogsData.data || [];
      const callbacks = callbacksData.data || [];

      // Calculate overview stats
      const agents = profiles.filter(p => p.role === 'agent');
      const clients = profiles.filter(p => p.role === 'client');
      const newLeads = profiles.filter(p => p.lead_status === 'new');
      const approvedLoans = loans.filter(l => l.status === 'approved' || l.status === 'funded');
      const rejectedLoans = loans.filter(l => l.status === 'rejected');
      const pendingLoans = loans.filter(l => l.status === 'pending' || l.status === 'in_review');

      const totalLoanAmount = loans.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
      const conversionRate = clients.length > 0 
        ? (approvedLoans.length / clients.length) * 100 
        : 0;

      setOverview({
        totalLeads: newLeads.length,
        totalClients: clients.length,
        totalAgents: agents.length,
        totalLoans: loans.length,
        approvedLoans: approvedLoans.length,
        rejectedLoans: rejectedLoans.length,
        pendingLoans: pendingLoans.length,
        totalLoanAmount,
        avgProcessingDays: 12, // Placeholder - would need actual calculation
        conversionRate,
      });

      // Calculate lead funnel
      const leadStatuses = profiles.reduce((acc, p) => {
        const status = p.lead_status || 'new';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setLeadFunnel({
        new: leadStatuses['new'] || 0,
        assigned: leadStatuses['assigned'] || 0,
        contacted: leadStatuses['contacted'] || 0,
        qualified: leadStatuses['qualified'] || 0,
        converted: leadStatuses['converted'] || 0,
        lost: leadStatuses['lost'] || 0,
      });

      // Loans by status
      const statusCounts: Record<string, number> = {};
      loans.forEach(l => {
        const status = l.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      setLoansByStatus(Object.entries(statusCounts).map(([status, count]) => ({ status, count })));

      // Calculate agent stats
      const agentStatsMap: Record<string, AgentStats> = {};
      
      agents.forEach(agent => {
        const profile = profiles.find(p => p.id === agent.id);
        agentStatsMap[agent.id] = {
          id: agent.id,
          name: 'Agent',
          email: '',
          clientsAssigned: 0,
          callsMade: 0,
          callbacksCompleted: 0,
          callbacksPending: 0,
          conversionRate: 0,
        };
      });

      // Get agent names
      const { data: agentProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', agents.map(a => a.id));

      agentProfiles?.forEach(ap => {
        if (agentStatsMap[ap.id]) {
          agentStatsMap[ap.id].name = `${ap.first_name || ''} ${ap.last_name || ''}`.trim() || 'Agent';
          agentStatsMap[ap.id].email = ap.email || '';
        }
      });

      // Count assignments per agent
      assignments.forEach(a => {
        if (agentStatsMap[a.agent_user_id]) {
          agentStatsMap[a.agent_user_id].clientsAssigned++;
        }
      });

      // Count calls per agent
      callLogs.forEach(c => {
        if (agentStatsMap[c.agent_id]) {
          agentStatsMap[c.agent_id].callsMade++;
        }
      });

      // Count callbacks per agent
      callbacks.forEach(cb => {
        if (agentStatsMap[cb.agent_id]) {
          if (cb.status === 'completed') {
            agentStatsMap[cb.agent_id].callbacksCompleted++;
          } else if (cb.status === 'planned') {
            agentStatsMap[cb.agent_id].callbacksPending++;
          }
        }
      });

      // Calculate conversion rate per agent
      Object.values(agentStatsMap).forEach(agent => {
        const agentAssignments = assignments.filter(a => a.agent_user_id === agent.id);
        const agentClientIds = agentAssignments.map(a => a.client_user_id);
        const agentLoans = loans.filter(l => agentClientIds.includes(l.user_id));
        const agentApproved = agentLoans.filter(l => l.status === 'approved' || l.status === 'funded');
        
        agent.conversionRate = agentClientIds.length > 0 
          ? (agentApproved.length / agentClientIds.length) * 100 
          : 0;
      });

      setAgentStats(Object.values(agentStatsMap).sort((a, b) => b.clientsAssigned - a.clientsAssigned));

      // Monthly loan stats (last 6 months)
      const now = new Date();
      const monthlyData: { month: string; loans: number; amount: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        
        const monthLoans = loans.filter(l => {
          const loanDate = new Date(l.created_at);
          return loanDate.getMonth() === date.getMonth() && 
                 loanDate.getFullYear() === date.getFullYear();
        });

        monthlyData.push({
          month: monthStr,
          loans: monthLoans.length,
          amount: monthLoans.reduce((sum, l) => sum + (Number(l.amount) || 0), 0),
        });
      }
      
      setMonthlyStats(monthlyData);

    } catch (err) {
      logger.logError('Error loading analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement des analytics..." /></PageLayout>;
  }

  return (
    <PageLayout showAnimatedBackground={false}>
      <div className="admin-analytics-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <h1>📊 Analytics & Performance</h1>
            <p>Vue d'ensemble des performances et conversions</p>
          </div>
        </div>

        <div className="container">
          {/* Overview Stats */}
          {overview && (
            <div className="overview-stats fade-in">
              <Card className="stat-card primary" padding="lg">
                <div className="stat-header">
                  <Users size={24} />
                  <span className="stat-trend positive"><TrendingUp size={16} /></span>
                </div>
                <span className="stat-value">{overview.totalClients}</span>
                <span className="stat-label">Clients total</span>
              </Card>
              
              <Card className="stat-card" padding="lg">
                <div className="stat-header">
                  <FileText size={24} />
                </div>
                <span className="stat-value">{overview.totalLoans}</span>
                <span className="stat-label">Dossiers créés</span>
              </Card>
              
              <Card className="stat-card success" padding="lg">
                <div className="stat-header">
                  <CheckCircle size={24} />
                </div>
                <span className="stat-value">{overview.approvedLoans}</span>
                <span className="stat-label">Dossiers approuvés</span>
              </Card>
              
              <Card className="stat-card warning" padding="lg">
                <div className="stat-header">
                  <Clock size={24} />
                </div>
                <span className="stat-value">{overview.pendingLoans}</span>
                <span className="stat-label">En attente</span>
              </Card>
              
              <Card className="stat-card wide" padding="lg">
                <div className="stat-header">
                  <Target size={24} />
                </div>
                <span className="stat-value">{overview.conversionRate.toFixed(1)}%</span>
                <span className="stat-label">Taux de conversion</span>
              </Card>
              
              <Card className="stat-card wide amount" padding="lg">
                <div className="stat-header">
                  <TrendingUp size={24} />
                </div>
                <span className="stat-value">{formatCurrency(overview.totalLoanAmount)}</span>
                <span className="stat-label">Montant total des prêts</span>
              </Card>
            </div>
          )}

          {/* Charts Section */}
          <div className="charts-grid fade-in">
            {/* Lead Funnel */}
            {leadFunnel && (
              <Card className="chart-card" padding="lg">
                <h3><PieChart size={20} className="inline-icon" />Entonnoir des leads</h3>
                <div className="funnel-chart">
                  {[
                    { key: 'new', label: 'Nouveaux', value: leadFunnel.new, color: 'var(--primary)' },
                    { key: 'assigned', label: 'Assignés', value: leadFunnel.assigned, color: '#3b82f6' },
                    { key: 'contacted', label: 'Contactés', value: leadFunnel.contacted, color: '#8b5cf6' },
                    { key: 'qualified', label: 'Qualifiés', value: leadFunnel.qualified, color: '#f59e0b' },
                    { key: 'converted', label: 'Convertis', value: leadFunnel.converted, color: '#22c55e' },
                    { key: 'lost', label: 'Perdus', value: leadFunnel.lost, color: '#ef4444' },
                  ].map((stage, index) => {
                    const total = leadFunnel.new + leadFunnel.assigned + leadFunnel.contacted + 
                                  leadFunnel.qualified + leadFunnel.converted + leadFunnel.lost;
                    const percentage = total > 0 ? (stage.value / total) * 100 : 0;
                    return (
                      <div key={stage.key} className="funnel-stage">
                        <div className="funnel-label">
                          <span>{stage.label}</span>
                          <span className="funnel-value">{stage.value}</span>
                        </div>
                        <div className="funnel-bar-container">
                          <div 
                            className="funnel-bar" 
                            style={{ 
                              width: `${Math.max(percentage, 5)}%`,
                              background: stage.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Loans by Status */}
            {loansByStatus.length > 0 && (
              <Card className="chart-card" padding="lg">
                <h3><BarChart3 size={20} className="inline-icon" />Dossiers par statut</h3>
                <LoanStatsChart data={loansByStatus} type="bar" />
              </Card>
            )}
          </div>

          {/* Agent Performance Table */}
          <Card className="agents-performance-card fade-in" padding="lg">
            <h3><UserCheck size={20} className="inline-icon" />Performance des agents</h3>
            
            {agentStats.length === 0 ? (
              <div className="empty-state">
                <p>Aucun agent enregistré</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Clients assignés</th>
                      <th>Appels effectués</th>
                      <th>Rappels complétés</th>
                      <th>Rappels en attente</th>
                      <th>Taux conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentStats.map(agent => (
                      <tr key={agent.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar agent">
                              {agent.name[0] || 'A'}
                            </div>
                            <div className="user-info">
                              <span className="user-name">{agent.name}</span>
                              <span className="user-email">{agent.email}</span>
                            </div>
                          </div>
                        </td>
                        <td><strong>{agent.clientsAssigned}</strong></td>
                        <td>
                          <span className="stat-with-icon">
                            <Phone size={14} />
                            {agent.callsMade}
                          </span>
                        </td>
                        <td>
                          <span className="success-text">{agent.callbacksCompleted}</span>
                        </td>
                        <td>
                          <span className="warning-text">{agent.callbacksPending}</span>
                        </td>
                        <td>
                          <span className={`conversion-rate ${agent.conversionRate >= 20 ? 'good' : agent.conversionRate >= 10 ? 'medium' : 'low'}`}>
                            {agent.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Monthly Trends */}
          {monthlyStats.length > 0 && (
            <Card className="monthly-trends-card fade-in" padding="lg">
              <h3><TrendingUp size={20} className="inline-icon" />Évolution mensuelle</h3>
              <div className="monthly-bars">
                {monthlyStats.map((month, index) => {
                  const maxLoans = Math.max(...monthlyStats.map(m => m.loans), 1);
                  const height = (month.loans / maxLoans) * 100;
                  return (
                    <div key={index} className="month-bar-container">
                      <div className="month-bar" style={{ height: `${Math.max(height, 5)}%` }}>
                        <span className="bar-value">{month.loans}</span>
                      </div>
                      <span className="month-label">{month.month}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <style>{`
          .admin-analytics-page .page-header {
            background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
          }

          .admin-analytics-page .page-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
          }

          .overview-stats {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .overview-stats .stat-card {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .overview-stats .stat-card.wide {
            grid-column: span 2;
          }

          .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .stat-header svg {
            color: hsl(var(--muted-foreground));
          }

          .stat-card.primary .stat-header svg,
          .stat-card.primary .stat-value {
            color: hsl(var(--primary));
          }

          .stat-card.success .stat-header svg,
          .stat-card.success .stat-value {
            color: hsl(142 76% 36%);
          }

          .stat-card.warning .stat-header svg,
          .stat-card.warning .stat-value {
            color: hsl(38 92% 50%);
          }

          .stat-card.amount .stat-value {
            color: hsl(var(--primary));
            font-size: 1.25rem;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            padding: 0.25rem;
            border-radius: 0.25rem;
          }

          .stat-trend.positive {
            background: hsl(142 76% 36% / 0.1);
            color: hsl(142 76% 36%);
          }

          .overview-stats .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: hsl(var(--foreground));
          }

          .overview-stats .stat-label {
            font-size: 0.75rem;
            color: hsl(var(--muted-foreground));
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .chart-card h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .funnel-chart {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .funnel-stage {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .funnel-label {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
          }

          .funnel-value {
            font-weight: 600;
          }

          .funnel-bar-container {
            height: 24px;
            background: hsl(var(--muted));
            border-radius: 4px;
            overflow: hidden;
          }

          .funnel-bar {
            height: 100%;
            border-radius: 4px;
            transition: width 0.5s ease;
          }

          .agents-performance-card h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .user-cell {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .user-avatar.agent {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: hsl(var(--primary) / 0.1);
            color: hsl(var(--primary));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
          }

          .user-info {
            display: flex;
            flex-direction: column;
          }

          .user-name {
            font-weight: 500;
          }

          .user-email {
            font-size: 0.75rem;
            color: hsl(var(--muted-foreground));
          }

          .stat-with-icon {
            display: flex;
            align-items: center;
            gap: 0.375rem;
          }

          .success-text {
            color: hsl(142 76% 36%);
            font-weight: 600;
          }

          .warning-text {
            color: hsl(38 92% 50%);
            font-weight: 600;
          }

          .conversion-rate {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .conversion-rate.good {
            background: hsl(142 76% 36% / 0.1);
            color: hsl(142 76% 36%);
          }

          .conversion-rate.medium {
            background: hsl(38 92% 50% / 0.1);
            color: hsl(38 92% 50%);
          }

          .conversion-rate.low {
            background: hsl(var(--destructive) / 0.1);
            color: hsl(var(--destructive));
          }

          .monthly-trends-card h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .monthly-bars {
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            height: 200px;
            padding-top: 1rem;
          }

          .month-bar-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            flex: 1;
          }

          .month-bar {
            width: 40px;
            background: linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.6));
            border-radius: 4px 4px 0 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 0.25rem;
            min-height: 20px;
          }

          .bar-value {
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
          }

          .month-label {
            font-size: 0.75rem;
            color: hsl(var(--muted-foreground));
            text-transform: uppercase;
          }

          @media (max-width: 1024px) {
            .overview-stats {
              grid-template-columns: repeat(3, 1fr);
            }

            .overview-stats .stat-card.wide {
              grid-column: span 1;
            }

            .charts-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 640px) {
            .overview-stats {
              grid-template-columns: repeat(2, 1fr);
            }

            .month-bar {
              width: 30px;
            }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminAnalytics;
