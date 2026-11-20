import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

interface Props {
  title: string
  pending: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (resolutionNote: string) => void
}

/**
 * Asks for a resolution note before resolving an incident.
 *
 * - Always open: the parent shows/hides it by mounting it, so the note starts empty each time
 * - `onSubmit` receives the trimmed note; empty/whitespace-only notes can't be submitted
 * - Can't be dismissed while `pending`
 */

export function ResolveDialog({ title, pending, error, onCancel, onSubmit }: Props) {
  const [note, setNote] = useState('')
  const trimmed = note.trim()

  return (
    <Dialog open onClose={pending ? undefined : onCancel} fullWidth maxWidth="sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (trimmed) onSubmit(trimmed)
        }}
      >
        <DialogTitle>Resolve incident</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Describe how “{title}” was resolved. Resolving is final and cannot be undone.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            required
            fullWidth
            multiline
            minRows={3}
            label="Resolution note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={pending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          {/* The API rejects an empty note, so block it client-side too (whitespace counts as empty) */}
          <Button type="submit" variant="contained" color="success" disabled={!trimmed || pending}>
            {pending ? 'Resolving…' : 'Resolve'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
