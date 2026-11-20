import { useCallback, useState } from 'react'
import { Link as RouterLink, Outlet } from 'react-router'
import Alert from '@mui/material/Alert'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Snackbar from '@mui/material/Snackbar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import type { Notification } from '../types/notification.types'
import { useNotificationStream } from '../hooks/useNotificationStream'
import { ConnectionIndicator } from './ConnectionIndicator'

const HIGHLIGHT_MS = 10_000 // Duration to highlight new notifications in milliseconds(10seconds)

export interface LayoutContext {
  newIds: ReadonlySet<string>
}

/**
 * App shell: header, page content and the single live-update connection for the whole app.
 *
 * - Opens the notification stream once here, so it stays connected while moving between pages
 * - Newly created notifications are added to `newIds` for 10s and passed to pages via outlet context 
 * - New CRITICAL incidents also show a toast with a link to the incident
 * - Header shows the live connection status
 */

export function AppLayout() {
  const [newIds, setNewIds] = useState<ReadonlySet<string>>(new Set())
  const [criticalToast, setCriticalToast] = useState<Notification | null>(null)

  // Stable callback so the stream hook does not reconnect on every render
  const handleCreated = useCallback((n: Notification) => {
    setNewIds((prev) => new Set(prev).add(n.id))
    setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev)
        next.delete(n.id)
        return next
      })
    }, HIGHLIGHT_MS)
    if (n.severity === 'CRITICAL') setCriticalToast(n)
  }, [])

  const connection = useNotificationStream(handleCreated)

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
          >
            Notification Board
          </Typography>
          <ConnectionIndicator state={connection} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet context={{ newIds } satisfies LayoutContext} />
      </Container>

      {/* Show toast for new CRITICAL incidents */}
      <Snackbar
        open={criticalToast !== null}
        autoHideDuration={8000}
        onClose={() => setCriticalToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setCriticalToast(null)}
          action={
            criticalToast && (
              <Button
                color="inherit"
                component={RouterLink}
                to={`/notifications/${criticalToast.id}`}
                onClick={() => setCriticalToast(null)}
              >
                View 
              </Button>
            )
          }
        >
          New CRITICAL incident: {criticalToast?.title}
        </Alert>
      </Snackbar>
    </>
  )
}
