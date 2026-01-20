import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import Button from '@/components/finom/Button';
import Card from '@/components/finom/Card';

interface PushNotificationPromptProps {
  onEnable: () => Promise<boolean>;
  permission: NotificationPermission | 'default';
  isSupported: boolean;
}

const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({
  onEnable,
  permission,
  isSupported,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user has already dismissed this prompt
  useEffect(() => {
    const dismissed = localStorage.getItem('push-notification-prompt-dismissed');
    if (dismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await onEnable();
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('push-notification-prompt-dismissed', 'true');
  };

  // Don't show if not supported, already granted, denied, or dismissed
  if (!isSupported || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <Card className="push-notification-prompt fade-in" padding="md">
      <button className="prompt-dismiss" onClick={handleDismiss} aria-label="Fermer">
        <X size={16} />
      </button>
      
      <div className="prompt-content">
        <div className="prompt-icon">
          <Bell size={24} />
        </div>
        
        <div className="prompt-text">
          <h4>Activer les notifications</h4>
          <p>Recevez des alertes en temps réel pour les nouvelles actions de vos clients.</p>
        </div>
        
        <div className="prompt-actions">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleEnable}
            disabled={loading}
          >
            {loading ? 'Activation...' : 'Activer'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
          >
            Plus tard
          </Button>
        </div>
      </div>

      <style>{`
        .push-notification-prompt {
          position: relative;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1));
          border: 1px solid hsl(var(--primary) / 0.2);
          margin-bottom: 1.5rem;
        }

        .prompt-dismiss {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: none;
          border: none;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .prompt-dismiss:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .prompt-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .prompt-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          flex-shrink: 0;
        }

        .prompt-text {
          flex: 1;
          min-width: 200px;
        }

        .prompt-text h4 {
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin: 0 0 0.25rem 0;
        }

        .prompt-text p {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          margin: 0;
        }

        .prompt-actions {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 640px) {
          .prompt-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .prompt-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </Card>
  );
};

export default PushNotificationPrompt;
