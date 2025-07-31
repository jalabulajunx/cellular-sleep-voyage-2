import { useEffect } from 'react';
import { useUIStore } from '../../stores/gameStore';

export function NotificationSystem() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationProps {
  notification: {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    duration?: number;
  };
  onClose: () => void;
}

function Notification({ notification, onClose }: NotificationProps) {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  return (
    <div className={`notification ${notification.type}`}>
      <div className="notification-header">
        <div className="notification-title">{notification.title}</div>
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="notification-message">{notification.message}</div>
    </div>
  );
}