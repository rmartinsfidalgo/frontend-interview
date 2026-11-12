import type { Notification } from "@apis";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeEventSource } from "../../../test/fake-event-source";
import useNotificationsStream from "../use-notifications-stream";

const notification: Notification = {
  id: "n-1",
  title: "Database latency spike",
  severity: "CRITICAL",
  status: "OPEN",
  createdAt: "2026-11-11T09:00:00.000Z",
  updatedAt: "2026-11-11T09:00:00.000Z",
};

const createCallbacks = () => ({
  onCreated: vi.fn(),
  onUpdated: vi.fn(),
  onReconnect: vi.fn(),
});

describe("useNotificationsStream", () => {
  beforeEach(() => {
    FakeEventSource.reset();
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens a single connection to the notifications stream", () => {
    renderHook(() => useNotificationsStream(createCallbacks()));

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.latest().url).toMatch(/\/api\/notifications\/stream$/);
  });

  it("forwards notification_created events to onCreated", () => {
    const callbacks = createCallbacks();
    renderHook(() => useNotificationsStream(callbacks));

    FakeEventSource.latest().emit("notification_created", notification);

    expect(callbacks.onCreated).toHaveBeenCalledExactlyOnceWith(notification);
    expect(callbacks.onUpdated).not.toHaveBeenCalled();
  });

  it("forwards notification_updated events to onUpdated", () => {
    const callbacks = createCallbacks();
    renderHook(() => useNotificationsStream(callbacks));

    const updated = { ...notification, status: "IN_PROGRESS" as const };
    FakeEventSource.latest().emit("notification_updated", updated);

    expect(callbacks.onUpdated).toHaveBeenCalledExactlyOnceWith(updated);
    expect(callbacks.onCreated).not.toHaveBeenCalled();
  });

  it.each(["notification_created", "notification_updated"])(
    "ignores %s events with an invalid payload",
    (type) => {
      const callbacks = createCallbacks();
      renderHook(() => useNotificationsStream(callbacks));

      FakeEventSource.latest().emit(type, "{not json");

      expect(callbacks.onCreated).not.toHaveBeenCalled();
      expect(callbacks.onUpdated).not.toHaveBeenCalled();
    },
  );

  it("does not call onReconnect on the first open", () => {
    const callbacks = createCallbacks();
    renderHook(() => useNotificationsStream(callbacks));

    FakeEventSource.latest().open();

    expect(callbacks.onReconnect).not.toHaveBeenCalled();
  });

  it("calls onReconnect on every re-open after the first", () => {
    const callbacks = createCallbacks();
    renderHook(() => useNotificationsStream(callbacks));
    const es = FakeEventSource.latest();

    es.open(); // initial connection
    es.error(); // connection lost, browser retries
    es.open(); // reconnected
    es.error();
    es.open(); // reconnected again

    expect(callbacks.onReconnect).toHaveBeenCalledTimes(2);
  });

  it("logs a warning on connection errors without throwing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderHook(() => useNotificationsStream(createCallbacks()));

    expect(() => FakeEventSource.latest().error()).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("uses the latest callbacks after a rerender without reconnecting", () => {
    const first = createCallbacks();
    const second = createCallbacks();
    const { rerender } = renderHook((cb) => useNotificationsStream(cb), {
      initialProps: first,
    });

    rerender(second);
    FakeEventSource.latest().emit("notification_created", notification);

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(first.onCreated).not.toHaveBeenCalled();
    expect(second.onCreated).toHaveBeenCalledExactlyOnceWith(notification);
  });

  it("closes the connection on unmount", () => {
    const callbacks = createCallbacks();
    const { unmount } = renderHook(() => useNotificationsStream(callbacks));
    const es = FakeEventSource.latest();

    unmount();
    es.emit("notification_created", notification);

    expect(es.closed).toBe(true);
    expect(callbacks.onCreated).not.toHaveBeenCalled();
  });
});
