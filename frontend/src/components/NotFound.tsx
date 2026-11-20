import { Link as RouterLink } from 'react-router'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function NotFound({ message = 'Page not found' }: { message?: string }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h6">{message}</Typography>
      <Button component={RouterLink} to="/" variant="outlined">
        Back to dashboard
      </Button>
    </Stack>
  )
}
