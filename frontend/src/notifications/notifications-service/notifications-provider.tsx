import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import NotificationsContext from "./notifications-context";
import useNotificationsStream from "./use-notifications-stream";
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

  const [reloadKey, setReloadKey] = useState(0);
  const matchesFilters = useCallback(
    (n: Notification) =>
      (!severity || n.severity === severity) &&
      (!status || n.status === status),
    [severity, status],
  );

  // Latest list, read by SSE handlers to decide whether the total should change
  // (kept out of state updaters, which must stay pure — StrictMode runs them twice)
  const notificationsRef = useRef(notifications);
  useEffect(() => {
    notificationsRef.current = notifications;
  });

  const adjustTotal = useCallback((delta: number) => {
    setMetadata((m) => m && { ...m, totalElements: m.totalElements + delta });
  }, []);

  const onUpdateNotification = useCallback(
    (notification: Notification) => {
      const wasInList = notificationsRef.current?.some(
        (n) => n.id === notification.id,
      );
      const stillMatches = matchesFilters(notification);
      setNotifications((prev) =>
        prev
          ?.map((n) => (n.id === notification.id ? notification : n))
          .filter((n) => n.id !== notification.id || stillMatches),
      );
      if (wasInList && !stillMatches) adjustTotal(-1);
    },
    [matchesFilters, adjustTotal],
  );

  useNotificationsStream({
    onCreated: (n) => {
      const list = notificationsRef.current;
      if (!list || !matchesFilters(n) || list.some((x) => x.id === n.id)) {
        return;
      }
      setNotifications((prev) => (prev ? [n, ...prev] : prev));
      adjustTotal(1);
    },
    onUpdated: onUpdateNotification,
    onReconnect: () => setReloadKey((k) => k + 1),
  });

  const isFetchingRef = useRef(false);

  const onRequestNextPage = useCallback(async () => {
    if (!metadata || isFetchingRef.current) return;
    if (metadata.page + 1 >= metadata.totalPages) return;
    isFetchingRef.current = true;
    try {
      const response = await listNotifications({
        query: { severity, status, page: metadata.page + 1 },
      });
      if (response.data) {
        const { content, ...meta } = response.data;
        setMetadata(meta);

        setNotifications((prev) => {
          const existing = new Set((prev ?? []).map((n) => n.id));
          return [
            ...(prev ?? []),
            ...content.filter((n) => !existing.has(n.id)),
          ];
        });
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [metadata, severity, status]);

  useEffect(() => {
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
  }, [severity, status, reloadKey]);

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
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
