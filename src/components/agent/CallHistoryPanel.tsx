import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/finom/Card';
import StatusBadge from '@/components/common/StatusBadge';
import { agentApi, formatDateTime } from '@/services/api';
import logger from '@/lib/logger';
import { Phone, PhoneIncoming, PhoneOutgoing } from 'lucide-react';

const CallHistoryPanel: React.FC = () => {
  const { user } = useAuth();
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadCallLogs();
  }, [user]);

  const loadCallLogs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await agentApi.getCallLogs(user.id);
      setCallLogs(data || []);
    } catch (err) {
      logger.logError('Error loading call logs', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const CallTypeIcon = ({ type }: { type: string }) => {
    return type === 'inbound' ? (
      <PhoneIncoming size={18} className="text-green-600" />
    ) : (
      <PhoneOutgoing size={18} className="text-blue-600" />
    );
  };

  if (loading) {
    return (
      <Card className="call-history-panel" padding="lg">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Phone size={20} />
          Historique des appels
        </h3>
        <p className="text-center text-muted-foreground py-8">Chargement...</p>
      </Card>
    );
  }

  return (
    <Card className="call-history-panel" padding="lg">
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <Phone size={20} />
        Historique des appels
      </h3>
      
      {callLogs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Aucun appel enregistré</p>
      ) : (
        <div className="flex flex-col gap-3">
          {callLogs.slice(0, 10).map((log) => (
            <div 
              key={log.id} 
              className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
            >
              <div className="mt-0.5">
                <CallTypeIcon type={log.call_type} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold block">
                  {log.client?.first_name} {log.client?.last_name}
                </span>
                <span className="text-sm text-muted-foreground block">
                  {formatDateTime(log.created_at)}
                </span>
                {log.notes && (
                  <span className="text-sm text-muted-foreground italic block mt-1">
                    {log.notes}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge 
                  status={log.call_status === 'answered' ? 'completed' : 'pending'} 
                  size="sm" 
                />
                <span className="text-sm text-muted-foreground font-mono">
                  {formatDuration(log.duration_seconds)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CallHistoryPanel;