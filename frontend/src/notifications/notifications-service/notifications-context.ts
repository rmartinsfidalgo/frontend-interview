import type { Notification, NotificationSeverity, NotificationStatus } from "@apis";
import { createContext } from "react";

// [Todo] Define generic types for states
type NotificationsContextType ={
    notifications: Notification[] | undefined;
    setNotifications:(notifications:Notification[])=>void;
    status: NotificationStatus | undefined
    setStatus:(severity: NotificationStatus | undefined)=>void
    severity: NotificationSeverity | undefined
    setSeveriity:(severity: NotificationSeverity | undefined)=>void
}

const NotificationsContext = createContext<NotificationsContextType|null>(null);

export default NotificationsContext;
