import React, { useState, createContext, useContext } from "react";
import AppsContainer from "@crema/components/AppsContainer";
import NotificationSidebar from "./NotificationSidebar";
import NotificationContent from "./NotificationContent";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type { Notification } from "@crema/mockapi/apis/notifications/NotificationService";

// Tạo context để chia sẻ notifications data
interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  reCallAPI: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
};

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [{ apiData: notifications, loading }, { reCallAPI }] = useGetDataApi<
    Notification[]
  >("/api/notifications?userId=500");

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const contextValue: NotificationContextType = {
    notifications: notifications || [],
    loading,
    reCallAPI,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      <AppsContainer
        title="Notifications"
        sidebarContent={
          <NotificationSidebar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        }
      >
        <NotificationContent activeFilter={activeFilter} />
      </AppsContainer>
    </NotificationContext.Provider>
  );
};

export default Notifications;
