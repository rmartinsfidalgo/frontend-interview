import { Link as RouterLink, useNavigate } from 'react-router'
import Link from '@mui/material/Link'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import type { Notification } from '../types/notification.types'
import { formatDateTime, formatRelative } from '../utils/format'
import { SeverityChip } from './SeverityChip'
import { StatusChip } from './StatusChip'

interface Props {
  rows: Notification[]
  newIds: ReadonlySet<string>
  backTo: string
}
/**
 * Table of notifications for the current dashboard page.
 *
 * - Whole row is clickable; the title is also a real link so keyboard, middle-click and "open in new tab" work
 *   (the link stops propagation so the row click doesn't navigate twice)
 * - Rows in `newIds` (just arrived via the live stream) are briefly highlighted
 * - Resolved rows are dimmed
 * - Times show as relative ("5 minutes ago"); hover for the full date
 */

export function NotificationTable({ rows, newIds, backTo }: Props) {
  const navigate = useNavigate()
  return (
    <Table size="small" aria-label="Notifications">
      <TableHead>
        <TableRow>
          <TableCell>Severity</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Created</TableCell>
          <TableCell>Last update</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((n) => {
          const to = `/notifications/${n.id}`
          return (
            <TableRow
              key={n.id}
              hover
              onClick={() => navigate(to, { state: { from: backTo } })}
              sx={{
                cursor: 'pointer',
                transition: 'background-color 1s',
                ...(newIds.has(n.id) && { bgcolor: 'action.selected' }),
                ...(n.status === 'RESOLVED' && { opacity: 0.6 }),
              }}
            >
              <TableCell>
                <SeverityChip severity={n.severity} />
              </TableCell>
              <TableCell>
                <Link
                  component={RouterLink}
                  to={to}
                  state={{ from: backTo }}
                  underline="hover"
                  color="inherit"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ fontWeight: n.status === 'RESOLVED' ? 400 : 500 }}
                >
                  {n.title}
                </Link>
              </TableCell>
              <TableCell>
                <StatusChip status={n.status} />
              </TableCell>
              <TableCell>
                <Tooltip title={formatDateTime(n.createdAt)}>
                  <span>{formatRelative(n.createdAt)}</span>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip title={formatDateTime(n.updatedAt)}>
                  <span>{formatRelative(n.updatedAt)}</span>
                </Tooltip>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
