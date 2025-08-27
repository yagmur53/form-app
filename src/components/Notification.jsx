import { X, Check, AlertCircle } from "lucide-react";

export default function Notification({ notifications, setNotifications }) {
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map((n) => (
        <div key={n.id} className={`notification ${n.type}`}>
          {n.type === "error" && <AlertCircle size={18} />}
          {n.type === "success" && <Check size={18} />}
          <span>{n.message}</span>
          <button onClick={() => removeNotification(n.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
