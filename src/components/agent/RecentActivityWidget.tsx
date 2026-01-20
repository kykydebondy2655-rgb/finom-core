/**
 * Recent Activity Widget for Agent Dashboard
 * Shows latest actions across all assigned clients
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Activity
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import { Badge } from '@/components/ui/badge';
import logger from '@/lib/logger';

interface RecentActivityWidgetProps {
  agentId: string;
  assignedClientIds: string[];
  maxItems?: number;
}

type ActivityType = 'email' | 'call' | 'status_change' | 'document' | 'note' | 'loan_status';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  clientId: string;
  clientName: string;
  timestamp: string;
  status?: 'success' | 'error' | 'info';
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  agentId,
  assignedClientIds,
  maxItems = 8
}) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignedClientIds.length > 0) {
      loadRecentActivities();
    } else {
      setLoading(false);
    }
  }, [agentId, assignedClientIds]);

  const loadRecentActivities = async () => {
    try {
      setLoading(true);

      // Fetch client profiles first for names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', assignedClientIds);

      const clientMap = new Map(
        profiles?.map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Client']) || []
      );

      // Parallel fetch all activity types
      const [emails, calls, statusChanges, documents, notes, loanStatuses] = await Promise.all([
        fetchEmails(assignedClientIds, clientMap),
        fetchCalls(assignedClientIds, clientMap),
        fetchStatusChanges(assignedClientIds, clientMap),
        fetchDocuments(assignedClientIds, clientMap),
        fetchNotes(assignedClientIds, clientMap),
        fetchLoanStatuses(assignedClientIds, clientMap)
      ]);

      // Merge and sort
      const allActivities = [
        ...emails,
        ...calls,
        ...statusChanges,
        ...documents,
        ...notes,
        ...loanStatuses
      ].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, maxItems);

      setActivities(allActivities);
    } catch (err) {
      logger.logError('Error loading recent activities', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async (clientIds: string[], clientMap: Map<string, string>): Promise<ActivityItem[]> => {
    try {
      const { data } = await supabase
        .from('email_logs' as any)
        .select('id, template, status, client_id, created_at')
        .in('client_id', clientIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!data) return [];

      return (data as any[]).map(e => ({
        id: `email-${e.id}`,
        type: 'email' as ActivityType,
        title: getEmailLabel(e.template),
        clientId: e.client_id,
        clientName: clientMap.get(e.client_id) || 'Client',
        timestamp: e.created_at,
        status: e.status === 'sent' ? 'success' as const : 'error' as const
      }));
    } catch {
      return [];
    }
  };

  const fetchCalls = async (clientIds: string[], clientMap: Map<string, string>): Promise<ActivityItem[]> => {
    const { data } = await supabase
      .from('call_logs')
      .select('id, call_status, client_id, created_at')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!data) return [];

    return data.map(c => ({
      id: `call-${c.id}`,
      type: 'call' as ActivityType,
      title: c.call_status === 'completed' ? 'Appel terminé' : 'Appel manqué',
      clientId: c.client_id,
      clientName: clientMap.get(c.client_id) || 'Client',
      timestamp: c.created_at,
      status: c.call_status === 'completed' ? 'success' as const : 'error' as const
    }));
  };

  const fetchStatusChanges = async (clientIds: string[], clientMap: Map<string, string>): Promise<ActivityItem[]> => {
    const { data } = await supabase
      .from('client_status_history')
      .select('id, new_status, client_id, created_at')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!data) return [];

    return data.map(s => ({
      id: `status-${s.id}`,
      type: 'status_change' as ActivityType,
      title: `Statut → ${s.new_status}`,
      clientId: s.client_id,
      clientName: clientMap.get(s.client_id) || 'Client',
      timestamp: s.created_at,
      status: 'info' as const
    }));
  };

  const fetchDocuments = async (clientIds: string[], clientMap: Map<string, string>): Promise<ActivityItem[]> => {
    const { data } = await supabase
      .from('documents')
      .select('id, file_name, status, user_id, uploaded_at')
      .in('user_id', clientIds)
      .order('uploaded_at', { ascending: false })
      .limit(5);

    if (!data) return [];

    return data.map(d => ({
      id: `doc-${d.id}`,
      type: 'document' as ActivityType,
      title: d.status === 'approved' ? 'Document validé' : d.status === 'rejected' ? 'Document refusé' : 'Document uploadé',
      clientId: d.user_id,
      clientName: clientMap.get(d.user_id) || 'Client',
      timestamp: d.uploaded_at,
      status: d.status === 'approved' ? 'success' as const : d.status === 'rejected' ? 'error' as const : 'info' as const
    }));
  };

  const fetchNotes = async (clientIds: string[], clientMap: Map<string, string>): Promise<ActivityItem[]> => {
    const { data } = await supabase
      .from('client_notes')
      .select('id, client_id, created_at')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!data) return [];

    return data.map(n => ({
      id: `note-${n.id}`,
      type: 'note' as ActivityType,
      title: 'Note ajoutée',
      clientId: n.client_id,
      clientName: clientMap.get(n.client_id) || 'Client',
      timestamp: n.created_at,
      status: 'info' as const
    }));
  };

  const fetchLoanStatuses = async (clientIds: string[], clientMap: Map<string, string>): Promise<ActivityItem[]> => {
    // Get loans for assigned clients
    const { data: loans } = await supabase
      .from('loan_applications')
      .select('id, user_id')
      .in('user_id', clientIds);

    if (!loans || loans.length === 0) return [];

    const loanUserMap = new Map(loans.map(l => [l.id, l.user_id]));
    const loanIds = loans.map(l => l.id);

    const { data } = await supabase
      .from('loan_status_history')
      .select('id, loan_id, new_status, created_at')
      .in('loan_id', loanIds)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!data) return [];

    return data.map(s => {
      const userId = loanUserMap.get(s.loan_id) || '';
      return {
        id: `loan-${s.id}`,
        type: 'loan_status' as ActivityType,
        title: `Dossier → ${s.new_status}`,
        clientId: userId,
        clientName: clientMap.get(userId) || 'Client',
        timestamp: s.created_at,
        status: s.new_status === 'funded' ? 'success' as const : s.new_status === 'rejected' ? 'error' as const : 'info' as const
      };
    });
  };

  const getActivityIcon = (type: ActivityType) => {
    const iconClass = "w-3.5 h-3.5";
    switch (type) {
      case 'email': return <Mail className={iconClass} />;
      case 'call': return <Phone className={iconClass} />;
      case 'status_change': return <RefreshCw className={iconClass} />;
      case 'document': return <FileText className={iconClass} />;
      case 'note': return <MessageSquare className={iconClass} />;
      case 'loan_status': return <AlertCircle className={iconClass} />;
      default: return <Clock className={iconClass} />;
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
      default: return null;
    }
  };

  return (
    <Card className="activity-widget-card fade-in" padding="lg">
      <div className="card-header">
        <h3><Activity size={20} className="inline-icon" />Activité récente</h3>
        {activities.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activities.length}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <p className="empty-text">Aucune activité récente</p>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/agent/clients/${activity.clientId}`)}
              >
                {/* Icon */}
                <div className={`w-7 h-7 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </span>
                    {getStatusIcon(activity.status)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.clientName}
                  </p>
                </div>

                {/* Time */}
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: fr })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};

// Helper
function getEmailLabel(template: string): string {
  const labels: Record<string, string> = {
    welcome: 'Email bienvenue',
    accountOpening: 'Ouverture compte',
    loanSubmitted: 'Demande prêt',
    loanApproved: 'Prêt approuvé',
    loanRejected: 'Prêt refusé',
    documentRequired: 'Doc. requis',
    documentValidated: 'Doc. validé',
    documentRejected: 'Doc. refusé',
    callbackReminder: 'Rappel RDV',
    notification: 'Notification'
  };
  return labels[template] || 'Email envoyé';
}

export default RecentActivityWidget;
