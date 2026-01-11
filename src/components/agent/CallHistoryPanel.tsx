import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/finom/Card';
import StatusBadge from '@/components/common/StatusBadge';
import { agentApi, formatDateTime } from '@/services/api';

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
      console.error('Error loading call logs:', err);
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      answered: 'Répondu',
      no_answer: 'Pas de réponse',
      busy: 'Occupé',
      voicemail: 'Messagerie'
    };
    return labels[status] || status;
  };

  const getCallTypeIcon = (type: string) => {
    return type === 'inbound' ? '📥' : '📤';
  };

  if (loading) {
    return (
      <Card className="call-history-panel" padding="lg">
        <h3>📋 Historique des appels</h3>
        <p className="loading-text">Chargement...</p>
      </Card>
    );
  }

  return (
    <Card className="call-history-panel" padding="lg">
      <h3>📋 Historique des appels</h3>
      
      {callLogs.length === 0 ? (
        <p className="empty-text">Aucun appel enregistré</p>
      ) : (
        <div className="call-logs-list">
          {callLogs.slice(0, 10).map((log) => (
            <div key={log.id} className="call-log-item">
              <div className="call-log-icon">
                {getCallTypeIcon(log.call_type)}
              </div>
              <div className="call-log-info">
                <span className="call-log-client">
                  {log.client?.first_name} {log.client?.last_name}
                </span>
                <span className="call-log-time">{formatDateTime(log.created_at)}</span>
                {log.notes && <span className="call-log-notes">{log.notes}</span>}
              </div>
              <div className="call-log-meta">
                <StatusBadge status={log.call_status === 'answered' ? 'completed' : 'pending'} size="sm" />
                <span className="call-log-duration">{formatDuration(log.duration_seconds)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .call-history-panel h3 {
          margin: 0 0 1rem 0;
        }
        .loading-text, .empty-text {
          color: var(--color-text-tertiary);
          text-align: center;
          padding: 2rem;
        }
        .call-logs-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .call-log-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: var(--radius-md);
        }
        .call-log-icon {
          font-size: 1.25rem;
        }
        .call-log-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .call-log-client {
          font-weight: 600;
        }
        .call-log-time {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .call-log-notes {
          font-size: 0.85rem;
          color: var(--color-text-tertiary);
          font-style: italic;
        }
        .call-log-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }
        .call-log-duration {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          font-family: monospace;
        }
      `}</style>
    </Card>
  );
};

export default CallHistoryPanel;
