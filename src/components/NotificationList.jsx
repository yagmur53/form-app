import React from "react";
import { AlertCircle, Check, X } from "lucide-react";

export default function NotificationList({
  notifications,
  removeNotification,
}) {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            {notification.type === "error" && <AlertCircle size={18} />}
            {notification.type === "success" && <Check size={18} />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="notification-close"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
