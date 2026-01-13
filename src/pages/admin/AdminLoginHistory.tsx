import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '@/lib/logger';

interface LoginRecord {
  id: string;
  user_id: string;
  email: string;
  user_role: string;
  first_name: string | null;
  last_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  logged_in_at: string;
}

const AdminLoginHistory: React.FC = () => {
  const [logs, setLogs] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'client' | 'agent' | 'admin'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .order('logged_in_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs((data as LoginRecord[]) || []);
    } catch (err) {
      logger.logError('Failed to load login history', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'agent': return '🧑‍💼';
      default: return '👤';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'agent': return 'Agent';
      default: return 'Client';
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    if (!deviceType) return '💻';
    if (deviceType.toLowerCase().includes('mobile')) return '📱';
    if (deviceType.toLowerCase().includes('tablet')) return '📱';
    return '💻';
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.user_role === filter;
    const matchesSearch = search === '' || 
      log.email.toLowerCase().includes(search.toLowerCase()) ||
      (log.first_name?.toLowerCase().includes(search.toLowerCase())) ||
      (log.last_name?.toLowerCase().includes(search.toLowerCase())) ||
      (log.ip_address?.includes(search));
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement de l'historique..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-login-history">
        <div className="page-header">
          <div className="container">
            <h1>🔐 Historique des connexions</h1>
            <p>Suivi de toutes les connexions utilisateur</p>
          </div>
        </div>

        <div className="container">
          {/* Stats */}
          <div className="stats-row fade-in">
            <Card className="stat-card" padding="md">
              <span className="stat-value">{logs.length}</span>
              <span className="stat-label">Connexions totales</span>
            </Card>
            <Card className="stat-card" padding="md">
              <span className="stat-value">{logs.filter(l => l.user_role === 'client').length}</span>
              <span className="stat-label">Clients</span>
            </Card>
            <Card className="stat-card" padding="md">
              <span className="stat-value">{logs.filter(l => l.user_role === 'agent').length}</span>
              <span className="stat-label">Agents</span>
            </Card>
            <Card className="stat-card" padding="md">
              <span className="stat-value">{logs.filter(l => l.user_role === 'admin').length}</span>
              <span className="stat-label">Admins</span>
            </Card>
          </div>

          {/* Filters */}
          <Card className="filters-card fade-in" padding="lg">
            <div className="filters-row">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Rechercher par email, nom ou IP..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Tous
                </button>
                <button 
                  className={`filter-btn ${filter === 'client' ? 'active' : ''}`}
                  onClick={() => setFilter('client')}
                >
                  👤 Clients
                </button>
                <button 
                  className={`filter-btn ${filter === 'agent' ? 'active' : ''}`}
                  onClick={() => setFilter('agent')}
                >
                  🧑‍💼 Agents
                </button>
                <button 
                  className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
                  onClick={() => setFilter('admin')}
                >
                  👑 Admins
                </button>
              </div>
            </div>
          </Card>

          {/* Logs Table */}
          {filteredLogs.length === 0 ? (
            <EmptyState 
              icon="📋" 
              title="Aucune connexion" 
              description="Aucun historique de connexion à afficher."
            />
          ) : (
            <Card className="table-card fade-in" padding="none">
              <div className="table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Date & Heure</th>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Adresse IP</th>
                      <th>Appareil</th>
                      <th>Navigateur / OS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="datetime-cell">
                          <div className="datetime">
                            <span className="date">
                              {format(new Date(log.logged_in_at), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                            <span className="time">
                              {format(new Date(log.logged_in_at), 'HH:mm:ss', { locale: fr })}
                            </span>
                          </div>
                        </td>
                        <td className="user-cell">
                          <div className="user-info">
                            <span className="user-name">
                              {log.first_name && log.last_name 
                                ? `${log.first_name} ${log.last_name}`
                                : log.email.split('@')[0]}
                            </span>
                            <span className="user-email">{log.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge role-${log.user_role}`}>
                            {getRoleIcon(log.user_role)} {getRoleLabel(log.user_role)}
                          </span>
                        </td>
                        <td className="ip-cell">
                          <code>{log.ip_address || 'N/A'}</code>
                        </td>
                        <td>
                          <span className="device-info">
                            {getDeviceIcon(log.device_type)} {log.device_type || 'Desktop'}
                          </span>
                        </td>
                        <td className="browser-cell">
                          <div className="browser-os">
                            <span className="browser">{log.browser || 'Inconnu'}</span>
                            <span className="os">{log.os || ''}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <style>{`
          .admin-login-history { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { background: linear-gradient(135deg, var(--color-admin) 0%, #5b21b6 100%); color: white; padding: 3rem 1.5rem; margin-bottom: 2rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.5rem; }
          .container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; }
          
          .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
          .stat-card { text-align: center; }
          .stat-value { font-size: 2rem; font-weight: 700; color: var(--color-admin); display: block; }
          .stat-label { font-size: 0.85rem; color: var(--color-text-secondary); }
          
          .filters-card { margin-bottom: 1.5rem; }
          .filters-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
          .search-box { flex: 1; min-width: 250px; }
          .search-box input { 
            width: 100%; 
            padding: 0.75rem 1rem; 
            border: 1px solid var(--color-border); 
            border-radius: 8px; 
            font-size: 0.95rem;
            background: var(--color-bg);
          }
          .search-box input:focus { outline: none; border-color: var(--color-admin); }
          .filter-buttons { display: flex; gap: 0.5rem; }
          .filter-btn { 
            padding: 0.5rem 1rem; 
            border: 1px solid var(--color-border); 
            background: white; 
            border-radius: 20px; 
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          .filter-btn:hover { border-color: var(--color-admin); }
          .filter-btn.active { 
            background: var(--color-admin); 
            color: white; 
            border-color: var(--color-admin); 
          }
          
          .table-card { overflow: hidden; }
          .table-wrapper { overflow-x: auto; }
          .logs-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
          .logs-table th { 
            background: var(--color-bg); 
            padding: 1rem; 
            text-align: left; 
            font-weight: 600; 
            border-bottom: 2px solid var(--color-border);
            white-space: nowrap;
          }
          .logs-table td { 
            padding: 1rem; 
            border-bottom: 1px solid var(--color-border); 
            vertical-align: middle;
          }
          .logs-table tr:hover { background: var(--color-bg-hover, #f9fafb); }
          
          .datetime-cell .datetime { display: flex; flex-direction: column; }
          .datetime .date { font-weight: 500; }
          .datetime .time { font-size: 0.8rem; color: var(--color-text-secondary); }
          
          .user-cell .user-info { display: flex; flex-direction: column; }
          .user-name { font-weight: 500; }
          .user-email { font-size: 0.8rem; color: var(--color-text-secondary); }
          
          .role-badge { 
            display: inline-flex; 
            align-items: center; 
            gap: 0.25rem; 
            padding: 0.25rem 0.75rem; 
            border-radius: 20px; 
            font-size: 0.85rem;
            font-weight: 500;
          }
          .role-badge.role-admin { background: #fef3c7; color: #92400e; }
          .role-badge.role-agent { background: #dbeafe; color: #1e40af; }
          .role-badge.role-client { background: #d1fae5; color: #065f46; }
          
          .ip-cell code { 
            background: var(--color-bg); 
            padding: 0.25rem 0.5rem; 
            border-radius: 4px; 
            font-size: 0.85rem;
          }
          
          .device-info { display: flex; align-items: center; gap: 0.25rem; }
          
          .browser-cell .browser-os { display: flex; flex-direction: column; }
          .browser-os .browser { font-weight: 500; }
          .browser-os .os { font-size: 0.8rem; color: var(--color-text-secondary); }
          
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          
          @media (max-width: 1024px) {
            .stats-row { grid-template-columns: repeat(2, 1fr); }
            .filters-row { flex-direction: column; align-items: stretch; }
            .filter-buttons { justify-content: center; }
          }
          @media (max-width: 640px) {
            .stats-row { grid-template-columns: 1fr 1fr; }
            .logs-table { font-size: 0.8rem; }
            .logs-table th, .logs-table td { padding: 0.75rem 0.5rem; }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminLoginHistory;
