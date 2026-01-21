/**
 * Unified Activity Timeline Component
 * Consolidates all client actions: emails, calls, status changes, documents, notes
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  FileText, 
  MessageSquare, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import logger from '@/lib/logger';

interface ActivityTimelineProps {
  clientId: string;
  loanId?: string;
  className?: string;
  maxItems?: number;
}

type ActivityType = 'email' | 'call' | 'status_change' | 'document' | 'note' | 'loan_status';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  fullContent?: string;
  timestamp: string;
  actor?: string;
  status?: 'success' | 'error' | 'pending' | 'info';
  metadata?: Record<string, unknown>;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  clientId,
  loanId,
  className = '',
  maxItems = 50
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    loadAllActivities();
  }, [clientId, loanId]);

  const loadAllActivities = async () => {
    try {
      setLoading(true);
      
      const [
        emailLogs,
        callLogs,
        statusHistory,
        documentEvents,
        notes,
        loanHistory
      ] = await Promise.all([
        loadEmailLogs(),
        loadCallLogs(),
        loadStatusHistory(),
        loadDocumentEvents(),
        loadNotes(),
        loadLoanStatusHistory()
      ]);

      // Merge and sort all activities by timestamp
      const allActivities = [
        ...emailLogs,
        ...callLogs,
        ...statusHistory,
        ...documentEvents,
        ...notes,
        ...loanHistory
      ].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, maxItems);

      setActivities(allActivities);
    } catch (err) {
      logger.logError('Error loading activities', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailLogs = async (): Promise<Activity[]> => {
    try {
      const { data, error } = await supabase
        .from('email_logs' as any)
        .select('id, template, subject, status, recipient_email, created_at, sent_by')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data) return [];

      const emailData = data as unknown as Array<{
        id: string;
        template: string;
        subject: string | null;
        status: string;
        recipient_email: string;
        created_at: string;
        sent_by: string | null;
      }>;

      return emailData.map(email => ({
        id: `email-${email.id}`,
        type: 'email' as ActivityType,
        title: getEmailTemplateLabel(email.template),
        description: `Envoyé à ${email.recipient_email}${email.subject ? ` - ${email.subject}` : ''}`,
        timestamp: email.created_at,
        actor: 'Agent',
        status: email.status === 'sent' ? 'success' as const : 'error' as const
      }));
    } catch {
      return [];
    }
  };

  const loadCallLogs = async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('call_logs')
      .select('id, call_type, call_status, duration_seconds, notes, created_at, agent_id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];

    // Fetch agent profiles
    const agentIds = [...new Set(data.map(c => c.agent_id).filter(Boolean))] as string[];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', agentIds);

    const profileMap = new Map(profiles?.map(p => [p.id, `${p.first_name} ${p.last_name}`]) || []);

    return data.map(call => ({
      id: `call-${call.id}`,
      type: 'call' as ActivityType,
      title: call.call_type === 'outbound' ? 'Appel sortant' : 'Appel entrant',
      description: `${getCallStatusLabel(call.call_status)}${call.duration_seconds ? ` (${formatDuration(call.duration_seconds)})` : ''}${call.notes ? ` - ${call.notes.slice(0, 50)}...` : ''}`,
      timestamp: call.created_at,
      actor: profileMap.get(call.agent_id) || 'Agent',
      status: call.call_status === 'completed' ? 'success' : call.call_status === 'no_answer' ? 'error' : 'info'
    }));
  };

  const loadStatusHistory = async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('client_status_history')
      .select('id, old_status, new_status, notes, created_at, changed_by')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];

    // Fetch changer profiles
    const changerIds = [...new Set(data.map(s => s.changed_by).filter(Boolean))] as string[];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', changerIds);

    const profileMap = new Map(profiles?.map(p => [p.id, `${p.first_name} ${p.last_name}`]) || []);

    return data.map(status => ({
      id: `status-${status.id}`,
      type: 'status_change' as ActivityType,
      title: 'Changement de statut client',
      description: `${status.old_status || 'Nouveau'} → ${status.new_status}${status.notes ? ` (${status.notes})` : ''}`,
      timestamp: status.created_at,
      actor: status.changed_by ? profileMap.get(status.changed_by) || 'Agent' : 'Système',
      status: 'info'
    }));
  };

  const loadDocumentEvents = async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select('id, file_name, status, category, uploaded_at, validated_at, validated_by, rejection_reason')
      .eq('user_id', clientId)
      .order('uploaded_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];

    const events: Activity[] = [];

    for (const doc of data) {
      // Upload event
      events.push({
        id: `doc-upload-${doc.id}`,
        type: 'document' as ActivityType,
        title: 'Document uploadé',
        description: `${doc.file_name} (${getCategoryLabel(doc.category)})`,
        timestamp: doc.uploaded_at,
        actor: 'Client',
        status: 'info'
      });

      // Validation event
      if (doc.validated_at) {
        events.push({
          id: `doc-validate-${doc.id}`,
          type: 'document' as ActivityType,
          title: doc.status === 'approved' ? 'Document validé' : 'Document refusé',
          description: `${doc.file_name}${doc.rejection_reason ? ` - ${doc.rejection_reason}` : ''}`,
          timestamp: doc.validated_at,
          actor: 'Agent',
          status: doc.status === 'approved' ? 'success' : 'error'
        });
      }
    }

    return events;
  };

  const loadNotes = async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('client_notes')
      .select('id, note, created_at, agent_id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];

    // Fetch agent profiles
    const agentIds = [...new Set(data.map(n => n.agent_id).filter(Boolean))] as string[];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', agentIds);

    const profileMap = new Map(profiles?.map(p => [p.id, `${p.first_name} ${p.last_name}`]) || []);

    return data.map(note => ({
      id: `note-${note.id}`,
      type: 'note' as ActivityType,
      title: 'Note ajoutée',
      description: note.note.slice(0, 100) + (note.note.length > 100 ? '...' : ''),
      fullContent: note.note,
      timestamp: note.created_at,
      actor: profileMap.get(note.agent_id) || 'Agent',
      status: 'info'
    }));
  };

  const loadLoanStatusHistory = async (): Promise<Activity[]> => {
    // Get client's loans first
    const { data: loans } = await supabase
      .from('loan_applications')
      .select('id')
      .eq('user_id', clientId);

    if (!loans || loans.length === 0) return [];

    const loanIds = loans.map(l => l.id);

    const { data, error } = await supabase
      .from('loan_status_history')
      .select('id, loan_id, old_status, new_status, notes, rejection_reason, next_action, created_at, changed_by')
      .in('loan_id', loanIds)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];

    // Fetch changer profiles
    const changerIds = [...new Set(data.map(s => s.changed_by).filter(Boolean))] as string[];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', changerIds);

    const profileMap = new Map(profiles?.map(p => [p.id, `${p.first_name} ${p.last_name}`]) || []);

    return data.map(status => ({
      id: `loan-status-${status.id}`,
      type: 'loan_status' as ActivityType,
      title: 'Changement statut dossier',
      description: `${status.old_status || 'Nouveau'} → ${status.new_status}${status.rejection_reason ? ` (${status.rejection_reason})` : ''}${status.notes ? ` - ${status.notes}` : ''}`,
      timestamp: status.created_at,
      actor: status.changed_by ? profileMap.get(status.changed_by) || 'Agent' : 'Système',
      status: status.new_status === 'rejected' ? 'error' : status.new_status === 'funded' ? 'success' : 'info'
    }));
  };

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter(a => a.type === filter);
  }, [activities, filter]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'status_change': return <RefreshCw className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'loan_status': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'email': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'status_change': return 'bg-purple-500';
      case 'document': return 'bg-orange-500';
      case 'note': return 'bg-yellow-500';
      case 'loan_status': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-500" />;
      case 'pending': return <Clock className="w-3 h-3 text-yellow-500" />;
      default: return null;
    }
  };

  const filterOptions: { value: ActivityType | 'all'; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'Tout', icon: <Filter className="w-3 h-3" /> },
    { value: 'email', label: 'Emails', icon: <Mail className="w-3 h-3" /> },
    { value: 'call', label: 'Appels', icon: <Phone className="w-3 h-3" /> },
    { value: 'status_change', label: 'Statuts', icon: <RefreshCw className="w-3 h-3" /> },
    { value: 'document', label: 'Documents', icon: <FileText className="w-3 h-3" /> },
    { value: 'note', label: 'Notes', icon: <MessageSquare className="w-3 h-3" /> },
    { value: 'loan_status', label: 'Dossiers', icon: <AlertCircle className="w-3 h-3" /> },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Historique des actions</span>
          <Badge variant="secondary" className="text-xs">
            {filteredActivities.length}
          </Badge>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>

      <CollapsibleContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-1 mt-3 mb-4">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                filter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune activité enregistrée
          </p>
        ) : (
          <div className="relative pl-6 space-y-4 max-h-[400px] overflow-y-auto">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />

            <AnimatePresence>
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 w-5 h-5 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div 
                    className={`bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-shadow ${
                      activity.fullContent ? 'cursor-pointer hover:border-primary/50' : ''
                    }`}
                    onClick={() => activity.fullContent && setSelectedActivity(activity)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">
                            {activity.title}
                          </span>
                          {getStatusIcon(activity.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {activity.description}
                        </p>
                        {activity.fullContent && activity.fullContent.length > 100 && (
                          <span className="text-xs text-primary mt-1 inline-block">
                            Cliquer pour voir tout
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{activity.actor}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span title={format(parseISO(activity.timestamp), 'PPpp', { locale: fr })}>
                          {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedActivity && getActivityIcon(selectedActivity.type)}
                {selectedActivity?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {selectedActivity?.fullContent || selectedActivity?.description}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{selectedActivity?.actor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {selectedActivity && format(parseISO(selectedActivity.timestamp), 'PPpp', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Helper functions
function getEmailTemplateLabel(template: string): string {
  const labels: Record<string, string> = {
    welcome: 'Email de bienvenue',
    accountOpening: 'Ouverture de compte',
    passwordReset: 'Réinitialisation mot de passe',
    loanSubmitted: 'Demande de prêt soumise',
    loanApproved: 'Prêt approuvé',
    loanRejected: 'Prêt refusé',
    loanOfferIssued: 'Offre de prêt émise',
    documentRequired: 'Document requis',
    documentValidated: 'Document validé',
    documentRejected: 'Document refusé',
    callbackReminder: 'Rappel de rendez-vous',
    notification: 'Notification',
    transferCompleted: 'Virement effectué'
  };
  return labels[template] || template;
}

function getCallStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'Terminé',
    no_answer: 'Pas de réponse',
    busy: 'Occupé',
    voicemail: 'Messagerie',
    callback_scheduled: 'Rappel planifié',
    in_progress: 'En cours'
  };
  return labels[status] || status;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getCategoryLabel(category: string | null): string {
  const labels: Record<string, string> = {
    id_card: 'Pièce d\'identité',
    proof_of_address: 'Justificatif de domicile',
    tax_notice: 'Avis d\'imposition',
    payslips: 'Bulletins de salaire',
    bank_statements: 'Relevés bancaires',
    compromise: 'Compromis de vente',
    other: 'Autre'
  };
  return labels[category || 'other'] || category || 'Document';
}

export default ActivityTimeline;
