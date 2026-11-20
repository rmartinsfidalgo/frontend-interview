import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: { mode: 'light' },
  components: {
    MuiButton: { defaultProps: { size: 'small' } },
    MuiChip: { defaultProps: { size: 'small' } },
    MuiTextField: { defaultProps: { size: 'small' } },
  },
})
