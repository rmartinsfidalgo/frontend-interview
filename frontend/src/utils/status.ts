import type { ChipProps } from '@mui/material/Chip'
import type { NotificationStatus } from  '../types/notification.types'

export const STATUSES: NotificationStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED']

export const STATUS_LABEL: Record<NotificationStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
}

export const STATUS_COLOR: Record<NotificationStatus, ChipProps['color']> = {
  OPEN: 'primary',
  IN_PROGRESS: 'secondary',
  RESOLVED: 'success',
}

export const NEXT_STATUS: Record<NotificationStatus, NotificationStatus | null> = {
  OPEN: 'IN_PROGRESS',
  IN_PROGRESS: 'RESOLVED',
  RESOLVED: null,
}
export const ACTION_LABEL: Record<NotificationStatus, string | null> = {
  OPEN: 'Acknowledge',
  IN_PROGRESS: 'Resolve',
  RESOLVED: null,
}
export const requiresNote = (target: NotificationStatus) => target === 'RESOLVED'