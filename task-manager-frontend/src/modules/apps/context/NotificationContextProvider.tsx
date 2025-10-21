import React, { createContext, useContext, ReactNode } from 'react';

export type NotificationContextType = {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
});

export const useNotificationContext = () => useContext(NotificationContext);

type NotificationContextProviderProps = {
  children: ReactNode;
};

const NotificationContextProvider: React.FC<NotificationContextProviderProps> = ({ children }) => {
  const notifications: any[] = [];
  const unreadCount = 0;
  const loading = false;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContextProvider;

