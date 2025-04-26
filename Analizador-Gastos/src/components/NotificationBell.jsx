import { useState, useRef, useEffect } from 'react';
import { FiBell, FiCheck, FiX } from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationBell.css';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, clearAll, unreadCount } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  return (
    <div className="notification-bell">
      <button 
        className={`bell-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel" ref={panelRef}>
          <div className="notifications-header">
            <h3>Notificaciones ({unreadCount} sin leer)</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button onClick={clearAll} className="clear-all-btn">
                  <FiCheck /> Marcar todo como leído
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <FiX />
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No hay notificaciones</p>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="mark-read-btn"
                    >
                      <FiCheck />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}