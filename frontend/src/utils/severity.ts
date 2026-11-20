import type { ChipProps } from '@mui/material/Chip'
import type { NotificationSeverity } from  '../types/notification.types'

export const SEVERITIES: NotificationSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export const SEVERITY_COLOR: Record<NotificationSeverity, ChipProps['color']> = {
  CRITICAL: 'error',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'default',
}
