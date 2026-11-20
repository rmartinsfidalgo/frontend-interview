import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type { CreateNotificationRequest, NotificationSeverity } from '../types/notification.types';
import { SEVERITIES } from '../utils/severity'

const TITLE_MAX = 100

interface Props {
  pending: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (body: CreateNotificationRequest) => void
}

/**
 * Form for reporting a new incident.
 *
 * - Always open: the parent shows/hides it by mounting it, so the form starts empty each time
 * - Title (max 100 chars) and severity are required; there's no default severity, so the reporter must pick one
 * - `onSubmit` receives trimmed values; an empty description is sent as `undefined`
 * - Can't be dismissed while `pending`
 */

export function CreateNotificationDialog({ pending, error, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState<NotificationSeverity | ''>('')
  const [description, setDescription] = useState('')

  const trimmedTitle = title.trim()
  const titleTooLong = trimmedTitle.length > TITLE_MAX
  const canSubmit = trimmedTitle !== '' && !titleTooLong && severity !== '' && !pending

  return (
    <Dialog open onClose={pending ? undefined : onCancel} fullWidth maxWidth="sm">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!canSubmit) return
          onSubmit({
            title: trimmedTitle,
            severity,
            description: description.trim() || undefined,
          })
        }}
      >
        <DialogTitle>New Incident</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              autoFocus
              required
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
              error={titleTooLong}
              helperText={`${trimmedTitle.length}/${TITLE_MAX}`}
            />
            <TextField
              select
              required
              fullWidth
              label="Severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as NotificationSeverity)}
              disabled={pending}
            >
              {SEVERITIES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={pending}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {pending ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
