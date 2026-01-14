import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/finom/Toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile, formatDate } from '@/services/api';
import logger from '@/lib/logger';

interface AssignedLead {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  lead_status: string | null;
  pipeline_stage: string | null;
  assigned_at: string;
}

interface ManageLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent: Profile;
  allAgents: Profile[];
}

const ITEMS_PER_PAGE = 10;

const ManageLeadsModal: React.FC<ManageLeadsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  agent,
  allAgents
}) => {
  const toast = useToast();
  const [leads, setLeads] = useState<AssignedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [targetAgentId, setTargetAgentId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load leads when modal opens
  useEffect(() => {
    if (isOpen && agent) {
      loadAssignedLeads();
      setSelectedLeads(new Set());
      setSearchQuery('');
      setTargetAgentId('');
      setCurrentPage(1);
    }
  }, [isOpen, agent]);

  const loadAssignedLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_agent_assigned_leads', {
        _agent_id: agent.id
      });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      logger.logError('Error loading assigned leads', err);
      toast.error('Erreur lors du chargement des leads');
    } finally {
      setLoading(false);
    }
  };

  // Filter leads by search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter(lead => 
      (lead.first_name?.toLowerCase().includes(query)) ||
      (lead.last_name?.toLowerCase().includes(query)) ||
      (lead.email?.toLowerCase().includes(query)) ||
      (lead.phone?.includes(query))
    );
  }, [leads, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  // Other agents (exclude current agent)
  const otherAgents = useMemo(() => 
    allAgents.filter(a => a.id !== agent.id),
    [allAgents, agent.id]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(paginatedLeads.map(l => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSet = new Set(selectedLeads);
    if (checked) {
      newSet.add(leadId);
    } else {
      newSet.delete(leadId);
    }
    setSelectedLeads(newSet);
  };

  const handleUnassign = async () => {
    if (selectedLeads.size === 0) return;
    
    try {
      setProcessing(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('reassign_leads', {
        _lead_ids: Array.from(selectedLeads),
        _from_agent_id: agent.id,
        _to_agent_id: null,
        _admin_id: userData.user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; updated_count: number; requested_count: number };
      
      if (result.updated_count < result.requested_count) {
        toast.warning(`${result.updated_count}/${result.requested_count} leads retirés. Certains leads ont peut-être été modifiés.`);
      } else {
        toast.success(`${result.updated_count} lead${result.updated_count > 1 ? 's' : ''} retiré${result.updated_count > 1 ? 's' : ''} avec succès`);
      }

      setSelectedLeads(new Set());
      await loadAssignedLeads();
      onSuccess();
    } catch (err) {
      logger.logError('Error unassigning leads', err);
      toast.error('Erreur lors du retrait des leads');
    } finally {
      setProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (selectedLeads.size === 0 || !targetAgentId) return;
    
    try {
      setProcessing(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('reassign_leads', {
        _lead_ids: Array.from(selectedLeads),
        _from_agent_id: agent.id,
        _to_agent_id: targetAgentId,
        _admin_id: userData.user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; updated_count: number; requested_count: number };
      const targetAgent = otherAgents.find(a => a.id === targetAgentId);
      
      if (result.updated_count < result.requested_count) {
        toast.warning(`${result.updated_count}/${result.requested_count} leads transférés. Certains leads ont peut-être été modifiés.`);
      } else {
        toast.success(`${result.updated_count} lead${result.updated_count > 1 ? 's' : ''} transféré${result.updated_count > 1 ? 's' : ''} vers ${targetAgent?.first_name || 'agent'}`);
      }

      setSelectedLeads(new Set());
      setTargetAgentId('');
      await loadAssignedLeads();
      onSuccess();
    } catch (err) {
      logger.logError('Error transferring leads', err);
      toast.error('Erreur lors du transfert des leads');
    } finally {
      setProcessing(false);
    }
  };

  const allPageSelected = paginatedLeads.length > 0 && 
    paginatedLeads.every(l => selectedLeads.has(l.id));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Leads assignés à {agent.first_name} {agent.last_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} assigné{leads.length !== 1 ? 's' : ''}
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Chargement..." />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'Aucun lead trouvé pour cette recherche' : 'Aucun lead assigné à cet agent'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allPageSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={processing}
                    />
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Assigné le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                        disabled={processing}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {lead.first_name} {lead.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.email || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.phone || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {lead.pipeline_stage || lead.lead_status || 'assigned'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(lead.assigned_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {selectedLeads.size} sélectionné{selectedLeads.size !== 1 ? 's' : ''}
          </span>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUnassign}
            disabled={selectedLeads.size === 0 || processing}
          >
            {processing ? 'Traitement...' : 'Retirer de cet agent'}
          </Button>

          <div className="flex items-center gap-2">
            <Select value={targetAgentId} onValueChange={setTargetAgentId} disabled={processing}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Transférer vers..." />
              </SelectTrigger>
              <SelectContent>
                {otherAgents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.first_name} {a.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTransfer}
              disabled={selectedLeads.size === 0 || !targetAgentId || processing}
            >
              {processing ? 'Transfert...' : 'Transférer'}
            </Button>
          </div>

          <div className="flex-1" />
          
          <Button variant="ghost" size="sm" onClick={onClose} disabled={processing}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageLeadsModal;
