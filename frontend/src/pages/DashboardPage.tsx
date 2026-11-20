import { useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { NotificationSeverity, NotificationStatus } from  '../types/notification.types'
import type { LayoutContext } from '../components/AppLayout'
import { CreateNotificationDialog } from '../components/CreateNotificationDialog'
import { NotificationTable } from '../components/NotificationTable'
import { SummaryCards } from '../components/SummaryCards'
import { SEVERITIES } from '../utils/severity'
import { STATUSES, STATUS_LABEL } from '../utils/status'
import { useCreateNotification, useNotificationList } from '../hooks/useNotifications'

const PAGE_SIZES = [10, 25, 50]
const DEFAULT_PAGE_SIZE = 10

/**
 * Main incident list: summary cards, filters, paged table and "New Incident".
 *
 * - Filters and page live in the URL (see useDashboardParams), so views can be shared, bookmarked and survive a refresh
 * - Clicking a summary card replaces the status/severity filters and goes back to page 1
 * - Keeps showing the previous page while the next one loads
 * - If new notifications arrive while on a later page, a banner offers to jump back to the latest
 * - Creating an incident opens it straight away
 */

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined
}

function useDashboardParams() {
  const [params, setParams] = useSearchParams()

  const status = parseEnum<NotificationStatus>(params.get('status'), STATUSES)
  const severity = parseEnum<NotificationSeverity>(params.get('severity'), SEVERITIES)
  const page = Math.max(0, Number(params.get('page')) || 0)
  const sizeParam = Number(params.get('size'))
  const size = PAGE_SIZES.includes(sizeParam) ? sizeParam : DEFAULT_PAGE_SIZE

  const update = (changes: Record<string, string | number | undefined>) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === '') next.delete(key)
        else next.set(key, String(value))
      }
      if (next.get('page') === '0') next.delete('page')
      return next
    })

  return { status, severity, page, size, update, search: params.toString() }
}

export function DashboardPage() {
  const { newIds } = useOutletContext<LayoutContext>()
  const { status, severity, page, size, update, search } = useDashboardParams()
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useNotificationList({
    status,
    severity,
    page,
    size,
  })

  const hasFilters = status !== undefined || severity !== undefined
  const backTo = search ? `/?${search}` : '/'

  const navigate = useNavigate()
  const create = useCreateNotification()
  const [creating, setCreating] = useState(false)

  const closeCreate = () => {
    setCreating(false)
    create.reset()
  }

  return (
    <Stack spacing={3}>
      <SummaryCards onSelect={(filter) => update({ status: filter.status, severity: filter.severity, page: 0 })} />

      <Paper variant="outlined">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ p: 2, alignItems: { sm: 'center' } }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Incidents
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
            New Incident
          </Button>
          <TextField
            select
            label="Status"
            value={status ?? ''}
            onChange={(e) => update({ status: e.target.value, page: 0 })}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Severity"
            value={severity ?? ''}
            onChange={(e) => update({ severity: e.target.value, page: 0 })}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All severities</MenuItem>
            {SEVERITIES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          {hasFilters && (
            <Button onClick={() => update({ status: undefined, severity: undefined, page: 0 })}>
              Clear filters
            </Button>
          )}
        </Stack>

        {/* New items are inserted at the top, so later pages shift under the operator */}
        {page > 0 && newIds.size > 0 && (
          <Alert
            severity="info"
            sx={{ mx: 2, mb: 2 }}
            action={
              <Button color="inherit" onClick={() => update({ page: 0 })}>
                Go to latest
              </Button>
            }
          >
            New notifications arrived. Items on this page may have shifted.
          </Alert>
        )}

        {isLoading ? (
          <Stack spacing={1} sx={{ p: 2 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} variant="rounded" height={36} />
            ))}
          </Stack>
        ) : isError ? (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <Button color="inherit" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Could not load notifications: {error.message}
          </Alert>
        ) : data && data.content.length > 0 ? (
          <>
            <Stack sx={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <NotificationTable rows={data.content} newIds={newIds} backTo={backTo} />
            </Stack>
            <TablePagination
              component="div"
              count={data.totalElements}
              page={Math.min(page, Math.max(0, data.totalPages - 1))}
              rowsPerPage={size}
              rowsPerPageOptions={PAGE_SIZES}
              onPageChange={(_, p) => update({ page: p })}
              onRowsPerPageChange={(e) => update({ size: Number(e.target.value), page: 0 })}
            />
          </>
        ) : (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            {hasFilters ? 'No notifications match these filters.' : 'No notifications yet.'}
          </Typography>
        )}
      </Paper>

      {creating && (
        <CreateNotificationDialog
          pending={create.isPending}
          error={create.error?.message ?? null}
          onCancel={closeCreate}
          onSubmit={(body) =>
            create.mutate(body, {
              onSuccess: (n) => {
                closeCreate()
                navigate(`/notifications/${n.id}`, { state: { from: backTo } })
              },
            })
          }
        />
      )}
    </Stack>
  )
}
