import { useEffect, useState, type ReactNode } from "react";
import NotificationsContext from "./notifications-context";
import {
  listNotifications,
  type Notification,
  type NotificationSeverity,
  type NotificationStatus,
} from "@apis";

type NotificationsProviderProps = {
  children: ReactNode;
  // [Todo] Add more props to control initial states of the app
};
export default function NotificationProvider({
  children,
}: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<
    Notification[] | undefined
  >();
  const [status, setStatus] = useState<NotificationStatus | undefined>("OPEN");
  const [severity, setSeveriity] = useState<NotificationSeverity | undefined>(
    "CRITICAL",
  );
  const initNotifications = async () => {
    const response = await listNotifications({
      query: { status, severity, page: 0 },
    });
    if (response.data) {
      const { content } = response.data;
      setNotifications(content);
    } else {
      // [Todo] We need to handle this error in a proper way
      throw new Error("SOMETHING WENT WRONG");
    }
  };
  useEffect(() => {
    console.log("here");
    initNotifications();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        severity,
        setSeveriity,
        status,
        setStatus,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
