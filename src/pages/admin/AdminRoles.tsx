import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RoleManagementModal from '@/components/admin/RoleManagementModal';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Shield, UserCheck, User, Search, Filter } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  created_at: string;
  user_role: string;
}

const AdminRoles: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles with their roles from user_roles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to profiles
      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      
      const usersWithRoles: UserWithRole[] = (profiles || []).map(p => ({
        ...p,
        user_role: rolesMap.get(p.id) || p.role || 'client',
      }));

      setUsers(usersWithRoles);
    } catch (err) {
      logger.logError('Error loading users for role management', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.user_role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={16} className="role-icon admin" />;
      case 'agent': return <UserCheck size={16} className="role-icon agent" />;
      default: return <User size={16} className="role-icon client" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'role-badge admin';
      case 'agent': return 'role-badge agent';
      default: return 'role-badge client';
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.user_role === 'admin').length,
    agents: users.filter(u => u.user_role === 'agent').length,
    clients: users.filter(u => u.user_role === 'client').length,
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout showAnimatedBackground={false}>
      <div className="admin-roles-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <h1>Gestion des rôles</h1>
            <p>Gérez les permissions et rôles des utilisateurs</p>
          </div>
        </div>

        <div className="container">
          {/* Stats */}
          <div className="role-stats fade-in">
            <Card className="stat-card" padding="md">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total utilisateurs</span>
            </Card>
            <Card className="stat-card admin" padding="md">
              <Shield size={20} />
              <span className="stat-value">{stats.admins}</span>
              <span className="stat-label">Administrateurs</span>
            </Card>
            <Card className="stat-card agent" padding="md">
              <UserCheck size={20} />
              <span className="stat-value">{stats.agents}</span>
              <span className="stat-label">Agents</span>
            </Card>
            <Card className="stat-card client" padding="md">
              <User size={20} />
              <span className="stat-value">{stats.clients}</span>
              <span className="stat-label">Clients</span>
            </Card>
          </div>

          {/* Filters */}
          <div className="toolbar fade-in">
            <div className="search-wrapper">
              <Search size={18} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-wrapper">
              <Filter size={18} />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Administrateurs</option>
                <option value="agent">Agents</option>
                <option value="client">Clients</option>
              </select>
            </div>
          </div>

          {/* Users List */}
          <Card className="users-card fade-in" padding="lg">
            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className={`user-avatar ${user.user_role}`}>
                              {user.first_name?.[0] || user.email?.[0] || 'U'}
                            </div>
                            <span>{user.first_name} {user.last_name}</span>
                          </div>
                        </td>
                        <td>{user.email || '-'}</td>
                        <td>
                          <span className={getRoleBadgeClass(user.user_role)}>
                            {getRoleIcon(user.user_role)}
                            {user.user_role === 'admin' ? 'Admin' : 
                             user.user_role === 'agent' ? 'Agent' : 'Client'}
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                          >
                            <Shield size={14} className="btn-icon-text" />
                            Modifier
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Role Management Modal */}
        {selectedUser && (
          <RoleManagementModal
            isOpen={showRoleModal}
            onClose={() => {
              setShowRoleModal(false);
              setSelectedUser(null);
            }}
            onSuccess={loadUsers}
            user={selectedUser}
            currentRole={selectedUser.user_role}
          />
        )}

        <style>{`
          .admin-roles-page .page-header {
            background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
          }

          .admin-roles-page .page-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
          }

          .admin-roles-page .page-header p {
            margin: 0;
            opacity: 0.9;
          }

          .role-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .role-stats .stat-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            text-align: center;
          }

          .role-stats .stat-card svg {
            color: hsl(var(--muted-foreground));
          }

          .role-stats .stat-card.admin svg {
            color: hsl(var(--destructive));
          }

          .role-stats .stat-card.agent svg {
            color: hsl(var(--primary));
          }

          .role-stats .stat-card.client svg {
            color: hsl(142 76% 36%);
          }

          .role-stats .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: hsl(var(--foreground));
          }

          .role-stats .stat-label {
            font-size: 0.75rem;
            color: hsl(var(--muted-foreground));
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .toolbar {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
          }

          .search-wrapper,
          .filter-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: hsl(var(--card));
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
          }

          .search-wrapper svg,
          .filter-wrapper svg {
            color: hsl(var(--muted-foreground));
          }

          .search-wrapper {
            flex: 1;
            min-width: 250px;
          }

          .search-input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 0.875rem;
            color: hsl(var(--foreground));
          }

          .search-input:focus {
            outline: none;
          }

          .filter-select {
            border: none;
            background: transparent;
            font-size: 0.875rem;
            color: hsl(var(--foreground));
            cursor: pointer;
          }

          .user-cell {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.875rem;
            background: hsl(var(--muted));
            color: hsl(var(--foreground));
          }

          .user-avatar.admin {
            background: hsl(var(--destructive) / 0.1);
            color: hsl(var(--destructive));
          }

          .user-avatar.agent {
            background: hsl(var(--primary) / 0.1);
            color: hsl(var(--primary));
          }

          .user-avatar.client {
            background: hsl(142 76% 36% / 0.1);
            color: hsl(142 76% 36%);
          }

          .role-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .role-badge.admin {
            background: hsl(var(--destructive) / 0.1);
            color: hsl(var(--destructive));
          }

          .role-badge.agent {
            background: hsl(var(--primary) / 0.1);
            color: hsl(var(--primary));
          }

          .role-badge.client {
            background: hsl(142 76% 36% / 0.1);
            color: hsl(142 76% 36%);
          }

          @media (max-width: 768px) {
            .role-stats {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 480px) {
            .role-stats {
              grid-template-columns: 1fr;
            }

            .toolbar {
              flex-direction: column;
            }

            .search-wrapper {
              min-width: auto;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminRoles;
