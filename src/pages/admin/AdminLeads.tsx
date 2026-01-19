import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/finom/Toast';
import { adminApi, formatDate, Profile } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';

interface LeadWithAssignment extends Profile {
  assignedAgent?: Profile | null;
  assignmentId?: string;
}

const AdminLeads: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  const [leads, setLeads] = useState<LeadWithAssignment[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetAgentId, setTargetAgentId] = useState<string>('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'assigned'>('all');
  const [filterAgentId, setFilterAgentId] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all clients (leads)
      const [clientsData, agentsData, assignmentsData] = await Promise.all([
        adminApi.getAllClients(),
        adminApi.getAllAgents(),
        adminApi.getClientAssignments()
      ]);
      
      setAgents(agentsData || []);
      
      // Map assignments to leads
      const leadsWithAssignments: LeadWithAssignment[] = (clientsData || []).map(client => {
        const assignment = assignmentsData?.find(a => a.client_user_id === client.id);
        return {
          ...client,
          assignedAgent: assignment?.agent || null,
          assignmentId: assignment?.id
        };
      });
      
      setLeads(leadsWithAssignments);
    } catch (err) {
      logger.logError('Error loading leads', err);
      toast.error('Erreur lors du chargement des leads');
    } finally {
      setLoading(false);
    }
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = 
          lead.first_name?.toLowerCase().includes(q) ||
          lead.last_name?.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.phone?.includes(q);
        if (!match) return false;
      }
      
      // Status filter
      if (filterStatus === 'new' && lead.assignedAgent) return false;
      if (filterStatus === 'assigned' && !lead.assignedAgent) return false;
      
      // Agent filter
      if (filterAgentId && lead.assignedAgent?.id !== filterAgentId) return false;
      
      return true;
    });
  }, [leads, searchQuery, filterStatus, filterAgentId]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedLeads.map(l => l.id)));
    }
  };

  const handleSelectLead = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Batch assign
  const handleBatchAssign = async () => {
    if (!targetAgentId || selectedIds.size === 0 || !user?.id) {
      toast.error('Sélectionnez un agent et au moins un lead');
      return;
    }
    
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('batch_assign_leads', {
        _lead_ids: Array.from(selectedIds),
        _agent_id: targetAgentId,
        _admin_id: user.id
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; updated_count: number };
      toast.success(`${result.updated_count} lead(s) assigné(s) avec succès`);
      setSelectedIds(new Set());
      setTargetAgentId('');
      await loadData();
    } catch (err) {
      logger.logError('Batch assign error', err);
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setActionLoading(false);
    }
  };

  // Batch unassign
  const handleBatchUnassign = async () => {
    if (selectedIds.size === 0 || !user?.id) {
      toast.error('Sélectionnez au moins un lead');
      return;
    }
    
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('batch_assign_leads', {
        _lead_ids: Array.from(selectedIds),
        _agent_id: null,
        _admin_id: user.id
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; updated_count: number };
      toast.success(`${result.updated_count} lead(s) désassigné(s)`);
      setSelectedIds(new Set());
      await loadData();
    } catch (err) {
      logger.logError('Batch unassign error', err);
      toast.error('Erreur lors de la désassignation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <PageLayout><LoadingSpinner fullPage message="Chargement des leads..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="admin-leads-page">
        <div className="page-header">
          <div className="container">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
            <div className="header-content">
              <div>
                <h1>Gestion des Leads</h1>
                <p>{leads.length} leads au total • {leads.filter(l => !l.assignedAgent).length} non assignés</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Filters Bar */}
          <Card className="filters-card fade-in" padding="md">
            <div className="filters-row">
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="search-input"
              />
              
              <select 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
                className="filter-select"
              >
                <option value="all">Tous les statuts</option>
                <option value="new">Non assignés</option>
                <option value="assigned">Assignés</option>
              </select>
              
              <select 
                value={filterAgentId} 
                onChange={(e) => { setFilterAgentId(e.target.value); setCurrentPage(1); }}
                className="filter-select"
              >
                <option value="">Tous les agents</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Batch Actions Bar */}
          <Card className="actions-card fade-in" padding="md">
            <div className="actions-row">
              <span className="selection-count">
                {selectedIds.size > 0 ? `${selectedIds.size} sélectionné(s)` : 'Aucune sélection'}
              </span>
              
              <div className="action-controls">
                <select 
                  value={targetAgentId} 
                  onChange={(e) => setTargetAgentId(e.target.value)}
                  className="agent-select"
                  disabled={selectedIds.size === 0}
                >
                  <option value="">Choisir un agent</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
                  ))}
                </select>
                
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleBatchAssign}
                  disabled={selectedIds.size === 0 || !targetAgentId || actionLoading}
                  isLoading={actionLoading}
                >
                  Assigner
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleBatchUnassign}
                  disabled={selectedIds.size === 0 || actionLoading}
                >
                  Désassigner
                </Button>
              </div>
            </div>
          </Card>

          {/* Leads Table */}
          <Card className="leads-card fade-in" padding="lg">
            {filteredLeads.length === 0 ? (
              <div className="empty-state">
                <p>Aucun lead trouvé</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th className="checkbox-col">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.size === paginatedLeads.length && paginatedLeads.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Apport</th>
                        <th>Statut</th>
                        <th>Étape</th>
                        <th>Assigné à</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLeads.map(lead => (
                        <tr 
                          key={lead.id} 
                          className={selectedIds.has(lead.id) ? 'selected' : ''}
                          onClick={() => handleSelectLead(lead.id)}
                        >
                          <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={selectedIds.has(lead.id)}
                              onChange={() => handleSelectLead(lead.id)}
                            />
                          </td>
                          <td className="name-cell">
                            <span className="lead-avatar">{lead.first_name?.[0] || '?'}</span>
                            {lead.first_name} {lead.last_name}
                          </td>
                          <td>{lead.email || '-'}</td>
                          <td>{lead.phone || '-'}</td>
                          <td className="apport-cell">{lead.down_payment || '-'}</td>
                          <td>
                            <span className={`status-badge ${lead.lead_status || 'new'}`}>
                              {lead.lead_status === 'assigned' ? 'Assigné' : 'Nouveau'}
                            </span>
                          </td>
                          <td>{lead.pipeline_stage || '-'}</td>
                          <td>
                            {lead.assignedAgent ? (
                              <span className="agent-badge">
                                {lead.assignedAgent.first_name} {lead.assignedAgent.last_name?.[0]}.
                              </span>
                            ) : (
                              <span className="no-agent">—</span>
                            )}
                          </td>
                          <td className="date-cell">{formatDate(lead.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ← Précédent
                    </button>
                    <span>Page {currentPage} / {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        <style>{`
          .admin-leads-page { min-height: 100vh; background: var(--color-bg); padding-bottom: 4rem; }
          .page-header { 
            background: linear-gradient(135deg, var(--color-admin) 0%, #5b21b6 100%); 
            color: white; 
            padding: 2rem 1.5rem; 
            margin-bottom: 1.5rem; 
          }
          .back-btn { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }
          .page-header h1 { color: white; font-size: 2rem; margin-bottom: 0.25rem; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
          
          .filters-card, .actions-card { margin-bottom: 1rem; }
          .filters-row, .actions-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
          
          .search-input { 
            flex: 1; 
            min-width: 200px; 
            padding: 0.5rem 1rem; 
            border: 1px solid var(--color-border); 
            border-radius: 8px; 
            font-size: 0.9rem; 
          }
          .filter-select, .agent-select { 
            padding: 0.5rem 1rem; 
            border: 1px solid var(--color-border); 
            border-radius: 8px; 
            font-size: 0.9rem; 
            background: white;
            min-width: 150px;
          }
          
          .selection-count { font-weight: 500; color: var(--color-text-secondary); min-width: 120px; }
          .action-controls { display: flex; gap: 0.75rem; align-items: center; margin-left: auto; }
          
          .table-wrapper { overflow-x: auto; }
          .leads-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
          .leads-table th { 
            text-align: left; 
            padding: 0.75rem 0.5rem; 
            border-bottom: 2px solid var(--color-border); 
            font-weight: 600; 
            color: var(--color-text-secondary);
            white-space: nowrap;
          }
          .leads-table td { 
            padding: 0.75rem 0.5rem; 
            border-bottom: 1px solid var(--color-border); 
            vertical-align: middle;
          }
          .leads-table tbody tr { cursor: pointer; transition: background 0.15s; }
          .leads-table tbody tr:hover { background: var(--color-bg-secondary); }
          .leads-table tbody tr.selected { background: #eff6ff; }
          
          .checkbox-col { width: 40px; text-align: center; }
          .checkbox-col input { width: 16px; height: 16px; cursor: pointer; }
          
          .name-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
          .lead-avatar { 
            width: 28px; 
            height: 28px; 
            border-radius: 50%; 
            background: var(--color-primary); 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 0.75rem; 
            font-weight: 600; 
          }
          
          .status-badge { 
            display: inline-block; 
            padding: 0.2rem 0.6rem; 
            border-radius: 12px; 
            font-size: 0.75rem; 
            font-weight: 500; 
          }
          .status-badge.new { background: #dbeafe; color: #1e40af; }
          .status-badge.assigned { background: #dcfce7; color: #166534; }
          
          .agent-badge { 
            background: #f3e8ff; 
            color: #7c3aed; 
            padding: 0.2rem 0.5rem; 
            border-radius: 8px; 
            font-size: 0.8rem; 
            font-weight: 500; 
          }
          .no-agent { color: var(--color-text-tertiary); }
          .date-cell { color: var(--color-text-secondary); white-space: nowrap; }
          .apport-cell { font-weight: 500; color: var(--color-primary); }
          
          .pagination { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            gap: 1rem; 
            margin-top: 1.5rem; 
            padding-top: 1rem; 
            border-top: 1px solid var(--color-border); 
          }
          .pagination button { 
            padding: 0.5rem 1rem; 
            border: 1px solid var(--color-border); 
            border-radius: 6px; 
            background: white; 
            cursor: pointer; 
            font-size: 0.85rem;
          }
          .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
          .pagination button:not(:disabled):hover { background: var(--color-bg-secondary); }
          
          .empty-state { text-align: center; padding: 3rem; color: var(--color-text-tertiary); }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default AdminLeads;