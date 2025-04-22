'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './auth';
import { toast } from 'sonner';
import { debounce } from '@/lib/utils';

// Define notification types
enum NotificationType {
  info = 'info',
  error = 'error',
}

// Define notification categories
enum NotificationCategory {
  file = 'file',
}

// Define the structure of a notification object
type Notification = {
  type: NotificationType;
  category: NotificationCategory;
  message: string;
};

// Create a context for notifications
const NotificationContext = createContext<
  | {
      fileHook: number;
    }
  | undefined
>(undefined);

// Notification provider component
export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // State for managing retry attempts
  const [retry, setRetry] = useState(0);
  // State for triggering file updates
  const [fileHook, setFileHook] = useState(0);

  // Access authentication state
  const {
    state: { accessToken },
  } = useAuth();

  // Memoized notify function to display notifications
  const notify = useMemo(
    () =>
      debounce((rawMsg: string) => {
        const noti = JSON.parse(rawMsg) as Notification;
        if (noti.type !== NotificationType.error) {
          toast.info(noti.message);
        } else {
          toast.error(noti.message);
        }

        if (noti.category === NotificationCategory.file) {
          setFileHook((h) => h + 1);
        }
      }, 500),
    []
  );

  // Effect for managing WebSocket connection
  useEffect(() => {
    // If no access token, do nothing
    if (!accessToken?.access_token) {
      return;
    }

    // Construct WebSocket URL
    const apiUrl = new URL(
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
    );
    const ws = new WebSocket(
      `ws://${apiUrl.host}/notifications/ws?token=${accessToken.access_token}`
    );

    // Message listener to handle incoming messages
    const messageListener = (e: MessageEvent) => {
      notify(e.data);
    };

    // Close listener to handle WebSocket closure and retry
    const closeListener = () => {
      setTimeout(() => {
        setRetry((rt) => rt + 1);
      }, 3000);
    };

    // Add event listeners
    ws.addEventListener('message', messageListener);
    ws.addEventListener('close', closeListener);
    ws.addEventListener('error', closeListener);

    // Cleanup function to remove listeners and close WebSocket
    return () => {
      ws.removeEventListener('message', messageListener);
      ws.removeEventListener('close', closeListener);
      ws.removeEventListener('error', closeListener);
      ws.close();
    };
  }, [accessToken, retry, notify]);

  // Provide notification context value
  return (
    <NotificationContext.Provider
      value={{
        fileHook,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }

  return context;
};
