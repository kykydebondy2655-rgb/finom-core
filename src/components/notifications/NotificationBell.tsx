import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { formatDateTime } from '@/services/api';
import { Bell, FileText, MessageCircle, Phone, ClipboardList } from 'lucide-react';
import '@/styles/NotificationBell.css';

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

  const getCategoryIcon = (category: string): React.ReactNode => {
    const iconProps = { size: 16, className: 'notif-category-icon' };
    switch (category) {
      case 'loan': return <ClipboardList {...iconProps} />;
      case 'document': return <FileText {...iconProps} />;
      case 'message': return <MessageCircle {...iconProps} />;
      case 'callback': return <Phone {...iconProps} />;
      default: return <Bell {...iconProps} />;
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="bell-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
      >
        <Bell size={20} className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
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
              <div className="notification-empty-state">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty-state">Aucune notification</div>
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
    </div>
  );
};

export default NotificationBell;
