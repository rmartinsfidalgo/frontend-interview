import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/notifications.api'
import type { CreateNotificationRequest, ListParams, NotificationStatus } from '../types/notification.types'

/**
 * Query keys for all notification data.
 *
 * - Everything is nested under `keys.all`, so invalidating it refreshes lists, counts and details at once
 */
export const keys = {
  all: ['notifications'] as const,
  list: (p: ListParams) => ['notifications', 'list', p] as const,
  count: (p: ListParams) => ['notifications', 'count', p] as const,
  detail: (id: string) => ['notifications', 'detail', id] as const,
}

/**
 * Fetches one page of the notification list for the dashboard table.
 */
export const useNotificationList = (p: ListParams) =>
  useQuery({ queryKey: keys.list(p), queryFn: () => api.listNotifications(p), placeholderData: (prev) => prev })

/**
 * Returns the number of notifications matching the filters, for the summary cards.
 */
export const useCount = (p: ListParams) =>
  useQuery({ queryKey: keys.count(p), queryFn: () => api.listNotifications({ ...p, size: 1 }), select: (d) => d.totalElements })

/**
 * Fetches a single notification for the detail page.
 */
export const useNotification = (id: string) =>
  useQuery({ queryKey: keys.detail(id), queryFn: () => api.getNotification(id) })

/**
 * Moves a notification to its next status.
 *
 * - On success: updates the detail cache directly and refreshes lists/counts
 * - On error (e.g. 422 because someone else changed it first): refetches the detail so the page shows the real state
 */
export const useAdvanceStatus = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { status: NotificationStatus; resolutionNote?: string }) =>
      api.advanceStatus(id, v.status, v.resolutionNote),
    onSuccess: (n) => {
      qc.setQueryData(keys.detail(id), n)
      qc.invalidateQueries({ queryKey: keys.all })
    },
    onError: () => qc.invalidateQueries({ queryKey: keys.detail(id) }),
  })
}

/**
 * Creates a new notification.
 *
 * - On success: seeds the detail cache so navigating to the new incident renders instantly, and refreshes lists/counts
 */
export const useCreateNotification = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateNotificationRequest) => api.createNotification(body),
    onSuccess: (n) => {
      qc.setQueryData(keys.detail(n.id), n)
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}
