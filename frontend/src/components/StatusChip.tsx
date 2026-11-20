import Chip from '@mui/material/Chip'
import type { NotificationStatus } from '../types/notification.types'
import { STATUS_COLOR, STATUS_LABEL } from '../utils/status'

export function StatusChip({ status }: { status: NotificationStatus }) {
  return <Chip label={STATUS_LABEL[status]} color={STATUS_COLOR[status]} variant="outlined" />
}
