import type { ListNotificationsResponse, Notification, NotificationSeverity, NotificationStatus } from "@apis";
import { createContext, type Dispatch, type SetStateAction } from "react";
type MetadataType = Omit<ListNotificationsResponse,"content">
// [Todo] Define generic types for states
type NotificationsContextType ={
    notifications: Notification[] | undefined;
    setNotifications: Dispatch<SetStateAction<Notification[] | undefined>>;
    status: NotificationStatus | undefined
    setStatus:(severity: NotificationStatus | undefined)=>void
    severity: NotificationSeverity | undefined
    setSeveriity:(severity: NotificationSeverity | undefined)=>void
    metadata: MetadataType|undefined,
    setMetadata: (metadata:MetadataType)=>void,
    onRequestNextPage: ()=>void
}

const NotificationsContext = createContext<NotificationsContextType|null>(null);

export default NotificationsContext;
