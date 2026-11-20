import { useState } from 'react'
import { Link as RouterLink, useLocation, useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { ApiError } from '../api/notifications.api'
import { NotFound } from '../components/NotFound'
import { ResolveDialog } from '../components/ResolveDialog'
import { SeverityChip } from '../components/SeverityChip'
import { StatusChip } from '../components/StatusChip'
import { formatDateTime, formatRelative } from '../utils/format'
import { ACTION_LABEL, NEXT_STATUS, requiresNote, STATUSES, STATUS_LABEL } from '../utils/status'
import { useAdvanceStatus, useNotification } from '../hooks/useNotifications'


/**
 * Detail view for a single notification, with the action to move it to its next status.
 *
 * - "Back to dashboard" returns to the same filtered/paged view the operator came from (passed in router state)
 * - Shows only the one allowed next step; resolving opens a dialog that asks for a resolution note
 * - Shows "not found" for an unknown ID; any other load error shows a Retry button
 * - Live updates keep the page current if someone else changes the notification
 */

export function NotificationDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const backTo = (location.state as { from?: string } | null)?.from ?? '/'

  const { data: n, isLoading, error, refetch } = useNotification(id)
  const advance = useAdvanceStatus(id)
  const [resolving, setResolving] = useState(false)

  const backButton = (
    <Button component={RouterLink} to={backTo} startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
      Back to dashboard
    </Button>
  )

  if (isLoading) {
    return (
      <Stack spacing={2}>
        {backButton}
        <Skeleton variant="rounded" height={240} />
      </Stack>
    )
  }

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <NotFound message="Notification not found" />
    }
    return (
      <Stack spacing={2}>
        {backButton}
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Could not load notification: {error.message}
        </Alert>
      </Stack>
    )
  }

  if (!n) return null

  // The UI only ever offers the single allowed forward step, mirroring the API's rules
  const next = NEXT_STATUS[n.status]
  const actionLabel = ACTION_LABEL[n.status]
  const activeStep = n.status === 'RESOLVED' ? STATUSES.length : STATUSES.indexOf(n.status)

  const handleAction = () => {
    if (!next) return
    advance.reset()
    if (requiresNote(next)) setResolving(true)
    else advance.mutate({ status: next })
  }

  const closeDialog = () => {
    setResolving(false)
    advance.reset()
  }

  return (
    <Stack spacing={2}>
      {backButton}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'flex-start' } }}>
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={1}>
                <SeverityChip severity={n.severity} />
                <StatusChip status={n.status} />
              </Stack>
              <Typography variant="h5" component="h1">
                {n.title}
              </Typography>
            </Stack>
            {next && actionLabel && (
              <Button
                variant="contained"
                color={next === 'RESOLVED' ? 'success' : 'primary'}
                onClick={handleAction}
                disabled={advance.isPending}
              >
                {advance.isPending && !resolving ? 'Saving…' : actionLabel}
              </Button>
            )}
          </Stack>

          {/* e.g. 422 when another operator changed it first; the detail is refetched so the page shows the real state */}
          {advance.error && !resolving && (
            <Alert severity="error" onClose={() => advance.reset()}>
              {advance.error.message}
            </Alert>
          )}

          <Stepper activeStep={activeStep} alternativeLabel>
            {STATUSES.map((s) => (
              <Step key={s}>
                <StepLabel>{STATUS_LABEL[s]}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {n.resolutionNote && (
            <Alert severity="success" variant="outlined">
              <Typography variant="subtitle2">Resolution note</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{n.resolutionNote}</Typography>
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{n.description || 'No description provided.'}</Typography>
          </Box>

          <Divider />

          <Box
            component="dl"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'max-content 1fr',
              columnGap: 3,
              rowGap: 1,
              m: 0,
              '& dt': { color: 'text.secondary' },
              '& dd': { m: 0 },
            }}
          >
            <dt>Created</dt>
            <dd>
              {formatDateTime(n.createdAt)} ({formatRelative(n.createdAt)})
            </dd>
            <dt>Last update</dt>
            <dd>
              {formatDateTime(n.updatedAt)} ({formatRelative(n.updatedAt)})
            </dd>
            <dt>ID</dt>
            <dd>
              <Typography component="code" variant="body2" sx={{ fontFamily: 'monospace' }}>
                {n.id}
              </Typography>
            </dd>
          </Box>
        </Stack>
      </Paper>

      {/* Disappears automatically if a live update shows it was resolved elsewhere */}
      {resolving && next === 'RESOLVED' && (
        <ResolveDialog
          title={n.title}
          pending={advance.isPending}
          error={advance.error?.message ?? null}
          onCancel={closeDialog}
          onSubmit={(resolutionNote) =>
            advance.mutate({ status: 'RESOLVED', resolutionNote }, { onSuccess: () => setResolving(false) })
          }
        />
      )}
    </Stack>
  )
}
