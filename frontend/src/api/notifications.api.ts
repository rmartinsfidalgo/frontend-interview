import axios from 'axios'
import type {
  CreateNotificationRequest,
  ListParams,
  Notification,
  NotificationPage,
  NotificationStatus,
} from '../types/notification.types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const STREAM_URL = `${API_URL}/api/notifications/stream`

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

const http = axios.create({ baseURL: API_URL })

// Turn Axios errors into ApiError carrying the server's message (e.g. 422 business rules)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status ?? 0
    const message = err.response?.data?.message ?? err.message
    return Promise.reject(new ApiError(status, message))
  },
)

export const listNotifications = async (params: ListParams = {}) =>
  (await http.get<NotificationPage>('/api/notifications', { params })).data

export const getNotification = async (id: string) =>
  (await http.get<Notification>(`/api/notifications/${id}`)).data

export const createNotification = async (body: CreateNotificationRequest) =>
  (await http.post<Notification>('/api/notifications', body)).data

export const advanceStatus = async (id: string, status: NotificationStatus, resolutionNote?: string) =>
  (await http.patch<Notification>(`/api/notifications/${id}/status`, { status, resolutionNote })).data

/**
 * Opens the live notification stream
 *
 * - The browser reconnects automatically after a drop: `onError` fires on disconnect, `onOpen` again when back
 * - Returns a function that closes the connection
 */

export function subscribeToNotifications(handlers: {
  onCreated: (n: Notification) => void
  onUpdated: (n: Notification) => void
  onOpen?: () => void
  onError?: () => void
}): () => void {
  const es = new EventSource(STREAM_URL)
  const parse = (e: Event) => JSON.parse((e as MessageEvent).data) as Notification

  es.addEventListener('notification_created', (e) => handlers.onCreated(parse(e)))
  es.addEventListener('notification_updated', (e) => handlers.onUpdated(parse(e)))
  es.onopen = () => handlers.onOpen?.()
  es.onerror = () => handlers.onError?.() 

  return () => es.close()
}