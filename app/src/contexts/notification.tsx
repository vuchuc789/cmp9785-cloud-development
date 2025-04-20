'use client';

import React, { createContext, useEffect } from 'react';
import { useAuth } from './auth';

const NotificationContext = createContext(null);

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const {
    state: { accessToken },
  } = useAuth();

  useEffect(() => {
    if (!accessToken?.access_token) {
      return;
    }

    const apiUrl = new URL(
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
    );
    const ws = new WebSocket(
      `ws://${apiUrl.host}/notifications/ws?token=${accessToken.access_token}`
    );
    ws.addEventListener('message', (e) => {
      console.log(e.data);
    });

    return () => {
      ws.close();
    };
  }, [accessToken]);

  return (
    <NotificationContext.Provider value={null}>
      {children}
    </NotificationContext.Provider>
  );
};
