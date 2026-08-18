import React, { useState, useCallback, useContext, createContext, ReactNode, useEffect } from 'react';
import { ProfileIcon, TipIcon, LikedIcon } from '../constants';
import type { Notification as NotificationType } from '../types';

// Define the shape of the context
interface NotificationContextType {
  addNotification: (message: string, type: NotificationType['type']) => void;
}

// Create the context with a dummy default value
const NotificationContext = createContext<NotificationContextType>({
  addNotification: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

// Define extended notification type with count
interface ExtendedNotification extends NotificationType {
  count?: number;
  originalMessage?: string;
}

// The Toast component
const NotificationToast: React.FC<{
  notification: ExtendedNotification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300); // Wait for animation
    }, 4000); // 4 seconds visible

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss, notification.count]); // Reset timer if count changes (id changes too)

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const icons = {
    like: <LikedIcon className="w-6 h-6 text-pink-500" />,
    follow: <ProfileIcon className="w-6 h-6 text-primary" />,
    info: <TipIcon className="w-6 h-6 text-on-surface-secondary" />,
  };

  return (
    <div
      className={`relative flex items-center gap-4 w-full max-w-sm p-4 bg-background rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 ease-in-out transform ${
        isExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex-shrink-0 relative">
        {icons[notification.type]}
        {notification.count && notification.count > 1 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {notification.count}
            </span>
        )}
      </div>
      <p className="flex-1 font-semibold text-on-surface">{notification.message}</p>
      <button
        onClick={handleDismiss}
        className="text-on-surface-secondary hover:text-on-surface"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

// The container for toasts
const NotificationContainer: React.FC<{
  notifications: ExtendedNotification[];
  onDismiss: (id: string) => void;
}> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 space-y-2">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

// The provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType['type']) => {
    setNotifications((prev) => {
      // Check if a similar notification already exists
      const existingIndex = prev.findIndex(
        (n) => (n.originalMessage || n.message) === message && n.type === type
      );

      if (existingIndex !== -1) {
        const existing = prev[existingIndex];
        const newCount = (existing.count || 1) + 1;
        
        // Remove old
        const newNotifications = [...prev];
        newNotifications.splice(existingIndex, 1);
        
        // Add new with updated count
        const id = `notif-${Date.now()}-${Math.random()}`;
        return [{ 
            id, 
            message: message, // Keep original message, count is shown in badge
            type, 
            count: newCount,
            originalMessage: message 
        }, ...newNotifications];
      }

      // If not, add new
      const id = `notif-${Date.now()}-${Math.random()}`;
      return [{ id, message, type, count: 1, originalMessage: message }, ...prev];
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </NotificationContext.Provider>
  );
};