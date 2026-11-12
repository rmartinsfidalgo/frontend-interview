// Minimal EventSource stand-in for tests: jsdom doesn't implement EventSource.
// Tests drive it manually with `emit`, `open` and `error`.
export class FakeEventSource {
  static instances: FakeEventSource[] = [];

  static latest(): FakeEventSource {
    const instance = FakeEventSource.instances.at(-1);
    if (!instance) throw new Error("No EventSource was created");
    return instance;
  }

  static reset() {
    FakeEventSource.instances = [];
  }

  readonly url: string;
  closed = false;
  onopen: ((e: Event) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  private listeners = new Map<string, Set<(e: MessageEvent) => void>>();

  constructor(url: string | URL) {
    this.url = String(url);
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (e: MessageEvent) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: (e: MessageEvent) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  close() {
    this.closed = true;
  }

  // --- test helpers ---
  open() {
    if (!this.closed) this.onopen?.(new Event("open"));
  }

  error() {
    if (!this.closed) this.onerror?.(new Event("error"));
  }

  emit(type: string, data: unknown) {
    if (this.closed) return;
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    const event = new MessageEvent(type, { data: payload });
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }
}
