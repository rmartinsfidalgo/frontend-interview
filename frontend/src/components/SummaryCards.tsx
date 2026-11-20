import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { ListParams } from '../types/notification.types'
import { useCount } from '../hooks/useNotifications'

interface SummaryItem {
  label: string
  filter: Pick<ListParams, 'status' | 'severity'>
  alertWhenPositive?: boolean
}

const ITEMS: SummaryItem[] = [
  { label: 'Open critical', filter: { status: 'OPEN', severity: 'CRITICAL' }, alertWhenPositive: true },
  { label: 'Open', filter: { status: 'OPEN' } },
  { label: 'In progress', filter: { status: 'IN_PROGRESS' } },
  { label: 'Resolved', filter: { status: 'RESOLVED' } },
]

interface Props {
  onSelect: (filter: SummaryItem['filter']) => void
}

/**
 * Row of clickable count cards shown at the top of the dashboard.
 *
 * - Each card fetches its own count, so they load and update independently
 * - Clicking a card calls `onSelect` with that card's filter; the dashboard replaces its status/severity filters with it
 * - "Open critical" turns red while its count is above zero
 */
export function SummaryCards({ onSelect }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
      }}
    >
      {ITEMS.map((item) => (
        <SummaryCard key={item.label} item={item} onSelect={onSelect} />
      ))}
    </Box>
  )
}

function SummaryCard({ item, onSelect }: { item: SummaryItem; onSelect: Props['onSelect'] }) {
  const { data: count, isLoading } = useCount(item.filter)
  const alert = item.alertWhenPositive && (count ?? 0) > 0

  return (
    <Card
      variant="outlined"
      sx={
        alert
          ? { borderColor: 'error.main', bgcolor: (t) => alpha(t.palette.error.main, 0.06) }
          : undefined
      }
    >
      <CardActionArea onClick={() => onSelect(item.filter)} aria-label={`Show ${item.label}`}>
        <CardContent>
          <Typography variant="body2" color={alert ? 'error' : 'text.secondary'}>
            {item.label}
          </Typography>
          <Typography variant="h4" component="p" color={alert ? 'error' : 'text.primary'}>
            {isLoading ? <Skeleton width={40} /> : count}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
