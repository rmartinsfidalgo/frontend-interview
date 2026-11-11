import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import NotificationsContext from "./notifications-context";
import {
  listNotifications,
  type ListNotificationsResponse,
  type Notification,
  type NotificationSeverity,
  type NotificationStatus,
} from "@apis";

type NotificationsProviderProps = {
  children: ReactNode;
  // [Todo] Add more props to control initial states of the app
};
type MetaDataType = Omit<ListNotificationsResponse, "content">;
export default function NotificationProvider({
  children,
}: NotificationsProviderProps) {
  const [metadata, setMetadata] = useState<MetaDataType | undefined>();
  const [notifications, setNotifications] = useState<
    Notification[] | undefined
  >();
  const [status, setStatus] = useState<NotificationStatus | undefined>(
    undefined,
  );
  const [severity, setSeveriity] = useState<NotificationSeverity | undefined>(
    undefined,
  );

  const onUpdateNotification = useCallback((notification: Notification) => {
    setNotifications((prev) =>
      prev?.map((n) => (n.id === notification.id ? notification : n)),
    );
  }, []);

  const isFetchingRef = useRef(false);

  const onRequestNextPage = useCallback(async () => {
    if (!metadata || isFetchingRef.current) return;
    if (metadata.page + 1 >= metadata.totalPages) return; // no more pages
    isFetchingRef.current = true;
    try {
      const response = await listNotifications({
        query: { severity, status, page: metadata.page + 1 },
      });
      if (response.data) {
        const { content, ...meta } = response.data;
        setMetadata(meta);
        setNotifications((prev) => [...(prev ?? []), ...content]);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [metadata, severity, status]);

  useEffect(() => {
    // Set to true in cleanup so a stale response (from previous filters) is ignored
    let ignore = false;
    const initNotifications = async (
      updatedSeverity: NotificationSeverity | undefined,
      updatedStatus: NotificationStatus | undefined,
    ) => {
      // Reset The current States
      setNotifications(undefined);
      setMetadata(undefined);
      // Get Response
      const response = await listNotifications({
        query: { severity: updatedSeverity, status: updatedStatus },
      });
      if (ignore) return;
      if (response.data) {
        // Set New States
        const { content, ...meta } = response.data;
        setMetadata(meta);
        setNotifications(content);
      } else {
        // [Todo] We need to handle this error in a proper way
        throw new Error("SOMETHING WENT WRONG");
      }
    };
    initNotifications(severity, status);
    return () => {
      ignore = true;
    };
  }, [severity, status]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        severity,
        setSeveriity,
        status,
        setStatus,
        metadata,
        setMetadata,
        onRequestNextPage,
        onUpdateNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
