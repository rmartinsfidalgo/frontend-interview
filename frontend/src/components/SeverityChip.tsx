import Chip from '@mui/material/Chip'
import type { NotificationSeverity } from '../types/notification.types'
import { SEVERITY_COLOR } from '../utils/severity'

/**
 * 
 *Text label always accompanies the color so severity is not conveyed by color alone

 */
export function SeverityChip({ severity }: { severity: NotificationSeverity }) {
  return (
    <Chip
      label={severity}
      color={SEVERITY_COLOR[severity]}
      sx={{ fontWeight: 600, minWidth: 84 }}
    />
  )
}
