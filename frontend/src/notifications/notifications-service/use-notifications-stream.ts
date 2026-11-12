import { useEffect, useRef } from "react";
import type { Notification } from "@apis";
import { jsonParser } from "@utils";

type UseNotificationsStreamParams = {
  onCreated: (notification: Notification) => void;
  onUpdated: (notification: Notification) => void;
  onReconnect: () => void;
};

export default function useNotificationsStream(
  params: UseNotificationsStreamParams,
) {
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  });

  useEffect(() => {
    // [todo] Use .env file for the BASE_URL
    const es = new EventSource("http://localhost:8080/api/notifications/stream");
    let hasOpenedBefore = false;

    const handleCreated = (e: MessageEvent) => {
      const n = jsonParser<Notification|undefined>(e.data);
      if (n) paramsRef.current.onCreated(n);
    };

    const handleUpdated = (e: MessageEvent) => {
      const n =  jsonParser<Notification|undefined>(e.data);
      if (n) paramsRef.current.onUpdated(n);
    };

    es.addEventListener("notification_created", handleCreated);
    es.addEventListener("notification_updated", handleUpdated);
    es.onopen = () => {
      if (hasOpenedBefore) paramsRef.current.onReconnect();
      hasOpenedBefore = true;
    };
    es.onerror = () => console.warn("[SSE] retrying…");
    return () => es.close();
  }, []);
}
