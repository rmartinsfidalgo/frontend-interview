export type NotificationStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
export type NotificationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Notification {
  id: string
  title: string
  description?: string | null
  severity: NotificationSeverity
  status: NotificationStatus
  resolutionNote?: string | null
  createdAt: string
  updatedAt: string
}

export interface NotificationPage {
  content: Notification[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListParams {
  status?: NotificationStatus
  severity?: NotificationSeverity
  page?: number
  size?: number
}

export interface CreateNotificationRequest {
  title: string
  description?: string | null
  severity: NotificationSeverity
}
