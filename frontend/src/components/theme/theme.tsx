import { CssBaseline, Grid, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";
import { createTheme } from "@mui/material/styles";
import "./theme.css";
import { Header } from "./header";
import { Footer } from "./footer";

const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2C3033" },
        secondary: { main: "#272127" },
      },
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

type ThemeProps = {
  // [Todo] define header and footer dynamic
  //   header?: ReactNode;
  //   footer?: ReactNode;
  children?: ReactNode;
};
export default function Theme({ children }: ThemeProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid className="theme">
        <Grid className="theme-header">
          <Header />
        </Grid>
        <Grid className="theme-container">{children}</Grid>
        <Grid className="theme-footer">
          <Footer />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
