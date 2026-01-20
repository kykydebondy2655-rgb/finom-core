import React from 'react';
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';

interface NotificationSettingsPanelProps {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  onRequestPermission: () => Promise<boolean>;
}

const NotificationSettingsPanel: React.FC<NotificationSettingsPanelProps> = ({
  isSupported,
  permission,
  onRequestPermission,
}) => {
  const getStatusInfo = () => {
    if (!isSupported) {
      return {
        icon: <BellOff size={20} />,
        label: 'Non supporté',
        description: 'Votre navigateur ne supporte pas les notifications push.',
        color: 'muted',
      };
    }

    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle size={20} />,
          label: 'Activées',
          description: 'Vous recevez des notifications push en temps réel.',
          color: 'success',
        };
      case 'denied':
        return {
          icon: <XCircle size={20} />,
          label: 'Bloquées',
          description: 'Les notifications sont bloquées. Modifiez les paramètres de votre navigateur pour les activer.',
          color: 'destructive',
        };
      default:
        return {
          icon: <Bell size={20} />,
          label: 'Désactivées',
          description: 'Activez les notifications pour être alerté des nouvelles actions clients.',
          color: 'warning',
        };
    }
  };

  const status = getStatusInfo();

  return (
    <Card className="notification-settings-panel" padding="lg">
      <div className="settings-header">
        <h3>Notifications Push</h3>
      </div>

      <div className="settings-content">
        <div className={`status-indicator status-${status.color}`}>
          {status.icon}
          <span className="status-label">{status.label}</span>
        </div>

        <p className="status-description">{status.description}</p>

        {isSupported && permission === 'default' && (
          <Button variant="primary" size="sm" onClick={onRequestPermission}>
            <Bell size={16} className="btn-icon-text" />
            Activer les notifications
          </Button>
        )}

        {isSupported && permission === 'granted' && (
          <div className="notification-types">
            <h4>Types de notifications reçues :</h4>
            <ul>
              <li>📄 Nouveaux documents uploadés par les clients</li>
              <li>💰 Changements de statut des dossiers</li>
              <li>👤 Mises à jour des profils clients</li>
              <li>💬 Nouveaux messages</li>
              <li>🔐 Connexions clients</li>
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .notification-settings-panel {
          background: hsl(var(--card));
        }

        .settings-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          width: fit-content;
        }

        .status-indicator.status-success {
          background: hsl(142 76% 36% / 0.1);
          color: hsl(142 76% 36%);
        }

        .status-indicator.status-destructive {
          background: hsl(var(--destructive) / 0.1);
          color: hsl(var(--destructive));
        }

        .status-indicator.status-warning {
          background: hsl(38 92% 50% / 0.1);
          color: hsl(38 92% 50%);
        }

        .status-indicator.status-muted {
          background: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
        }

        .status-label {
          font-weight: 600;
        }

        .status-description {
          color: hsl(var(--muted-foreground));
          font-size: 0.875rem;
          margin: 0;
        }

        .notification-types {
          margin-top: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid hsl(var(--border));
        }

        .notification-types h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin: 0 0 0.5rem 0;
        }

        .notification-types ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .notification-types li {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </Card>
  );
};

export default NotificationSettingsPanel;
