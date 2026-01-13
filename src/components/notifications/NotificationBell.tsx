import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { formatDateTime } from '@/services/api';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useRealtimeNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  
  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    // Prevent double-click
    if (markingAsRead === notification.id) return;
    
    try {
      setMarkingAsRead(notification.id);
      await markAsRead(notification.id);
      setIsOpen(false);
      
      // Navigate based on notification type
      if (notification.related_entity === 'loan_applications' && notification.related_id) {
        navigate(`/loans/${notification.related_id}`);
      } else if (notification.related_entity === 'documents') {
        navigate('/loans');
      }
    } finally {
      setMarkingAsRead(null);
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'loan': return '📋';
      case 'document': return '📄';
      case 'message': return '💬';
      case 'callback': return '📞';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="bell-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="empty-state">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">Aucune notification</div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <span className="notif-icon">{getCategoryIcon(notif.category)}</span>
                  <div className="notif-content">
                    <span className="notif-title">{notif.title}</span>
                    <span className="notif-message">{notif.message}</span>
                    <span className="notif-time">{formatDateTime(notif.created_at)}</span>
                  </div>
                  {!notif.read && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .notification-bell-container { position: relative; }
        
        .bell-button {
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .bell-button:hover { background: rgba(0,0,0,0.05); }
        .bell-icon { font-size: 1.25rem; }
        
        .badge {
          position: absolute;
          top: 0;
          right: 0;
          min-width: 18px;
          height: 18px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        
        .notifications-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 360px;
          max-height: 480px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          z-index: 1000;
          overflow: hidden;
        }
        
        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .dropdown-header h4 { margin: 0; font-size: 1rem; }
        .mark-all-btn {
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 500;
        }
        .mark-all-btn:hover { text-decoration: underline; }
        
        .notifications-list { max-height: 400px; overflow-y: auto; }
        
        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f3f4f6;
          position: relative;
        }
        .notification-item:hover { background: #f9fafb; }
        .notification-item.unread { background: #eff6ff; }
        .notification-item.unread:hover { background: #dbeafe; }
        
        .notif-icon { font-size: 1.25rem; flex-shrink: 0; }
        .notif-content { flex: 1; min-width: 0; }
        .notif-title { display: block; font-weight: 600; color: #374151; font-size: 0.9rem; }
        .notif-message { display: block; font-size: 0.8rem; color: #6b7280; margin-top: 0.1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .notif-time { display: block; font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
        
        .unread-dot {
          width: 8px;
          height: 8px;
          background: var(--color-primary);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 0.5rem;
        }
        
        .empty-state {
          padding: 2rem;
          text-align: center;
          color: #9ca3af;
        }
        
        @media (max-width: 480px) {
          .notifications-dropdown {
            width: calc(100vw - 2rem);
            right: -1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
