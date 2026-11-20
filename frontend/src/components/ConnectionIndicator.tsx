import Chip, { type ChipProps } from '@mui/material/Chip'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import type { ConnectionState } from '../hooks/useNotificationStream'

const CONFIG: Record<ConnectionState, { label: string; color: ChipProps['color'] }> = {
  connecting: { label: 'Connecting…', color: 'default' },
  live: { label: 'Live', color: 'success' },
  reconnecting: { label: 'Reconnecting… data may be stale', color: 'warning' },
}

export function ConnectionIndicator({ state }: { state: ConnectionState }) {
  const { label, color } = CONFIG[state]
  return (
    <Chip
      icon={<FiberManualRecordIcon fontSize="small" />}
      label={label}
      color={color}
      variant="outlined"
      role="status"
      aria-live="polite"
    />
  )
}
