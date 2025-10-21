import React, { useEffect, useState } from "react";
import AppScrollbar from "@crema/components/AppScrollbar";
import AppList from "@crema/components/AppList";
import { Button, message, Modal } from "antd";
import NotificationItem from "./NotificationItem";
import {
  StyledNotificationContent,
  StyledNotificationHeader,
} from "./index.styled";
import IntlMessages from "@crema/helpers/IntlMessages";
import { putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { useNotificationContext } from "../index";
import type { Notification } from "@crema/mockapi/apis/notifications/NotificationService";

interface NotificationContentProps {
  activeFilter: string;
}

const NotificationContent: React.FC<NotificationContentProps> = ({
  activeFilter,
}) => {
  const { notifications, loading, reCallAPI } = useNotificationContext();
  const infoViewActionsContext = useInfoViewActionsContext();

  // Debug log
  console.log("🔔 NotificationContent: notifications =", notifications);
  console.log("🔔 NotificationContent: loading =", loading);
  console.log(
    "🔔 NotificationContent: notifications type =",
    typeof notifications
  );
  console.log(
    "🔔 NotificationContent: isArray =",
    Array.isArray(notifications)
  );

  const handleMarkAllAsRead = () => {
    putDataApi("/api/notifications/read-all", infoViewActionsContext, {
      userId: 500,
    })
      .then(() => {
        message.success("Đã đánh dấu tất cả thông báo là đã đọc");
        if (reCallAPI) {
          reCallAPI();
        }
      })
      .catch((error) => {
        console.error("Error marking all as read:", error);
        message.error("Không thể đánh dấu tất cả thông báo là đã đọc");
      });
  };

  const handleClearAll = () => {
    Modal.confirm({
      title: "Xác nhận xóa tất cả",
      content:
        "Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.",
      okText: "Có",
      cancelText: "Không",
      onOk() {
        console.log("🔔 Starting clear all notifications...");

        // Thử cả hai cách để đảm bảo hoạt động
        const clearNotifications = async () => {
          try {
            // Cách 1: Sử dụng putDataApi
            const response = await putDataApi(
              "/api/notifications/clear-all",
              infoViewActionsContext,
              {
                userId: 500,
              }
            );
            console.log("🔔 Clear all success response:", response);
            message.success("Đã xóa tất cả thông báo thành công");
            if (reCallAPI) {
              console.log("🔔 Calling reCallAPI to refresh data...");
              reCallAPI();
            }
          } catch (error) {
            console.error("🔔 putDataApi failed, trying direct fetch:", error);

            // Cách 2: Sử dụng fetch trực tiếp
            try {
              const fetchResponse = await fetch(
                "/api/notifications/clear-all",
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ userId: 500 }),
                }
              );

              if (fetchResponse.ok) {
                console.log("🔔 Direct fetch success");
                message.success("Đã xóa tất cả thông báo thành công");
                if (reCallAPI) {
                  reCallAPI();
                }
              } else {
                throw new Error(`HTTP ${fetchResponse.status}`);
              }
            } catch (fetchError) {
              console.error("🔔 Direct fetch also failed:", fetchError);
              message.error("Không thể xóa tất cả thông báo");
            }
          }
        };

        clearNotifications();
      },
    });
  };

  const handleMarkAsRead = (notificationId: number) => {
    putDataApi(
      `/api/notifications/${notificationId}/read`,
      infoViewActionsContext,
      {}
    )
      .then(() => {
        if (reCallAPI) {
          reCallAPI();
        }
      })
      .catch((error) => {
        console.error("Error marking as read:", error);
      });
  };

  // Filter notifications based on active filter
  const getFilteredNotifications = () => {
    if (!Array.isArray(notifications)) return [];

    switch (activeFilter) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "mentions":
        return notifications.filter(
          (n) => n.type === "member_assigned" || n.type === "member_removed"
        );
      case "assigned":
        return notifications.filter((n) => n.type === "member_assigned");
      case "comments":
        return notifications.filter((n) => n.type === "card_updated");
      case "due_dates":
        return notifications.filter(
          (n) => n.type === "card_created" || n.type === "card_moved"
        );
      default:
        return notifications;
    }
  };

  // Transform API data to component format
  const transformedNotifications = getFilteredNotifications().map(
    (notification) => ({
      id: notification.id,
      type: notification.type,
      user: {
        name: notification.actorName,
        avatar: notification.actorAvatar,
      },
      message: notification.message,
      target:
        notification.metadata?.cardTitle ||
        notification.metadata?.boardName ||
        "",
      timestamp: new Date(notification.createdAt).toLocaleString(),
      isRead: notification.isRead,
      notification, // Keep original notification for actions
    })
  );

  return (
    <StyledNotificationContent>
      <StyledNotificationHeader>
        <h2>
          <IntlMessages id="sidebar.apps.notifications" />
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="link" onClick={handleMarkAllAsRead}>
            <IntlMessages id="common.markAllAsRead" />
          </Button>
          <Button
            type="link"
            onClick={handleClearAll}
            style={{ color: "#ff4d4f" }}
          >
            <IntlMessages id="common.clearAll" />
          </Button>
        </div>
      </StyledNotificationHeader>

      <AppScrollbar style={{ height: "calc(100vh - 200px)" }}>
        <AppList
          data={transformedNotifications}
          renderItem={(notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          )}
        />
      </AppScrollbar>
    </StyledNotificationContent>
  );
};

export default NotificationContent;
