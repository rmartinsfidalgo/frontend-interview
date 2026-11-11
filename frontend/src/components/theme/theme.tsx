import { ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";
import { createTheme } from "@mui/material/styles";
import "./theme.css";
import { Header } from "./header";
import { Footer } from "./footer";

const theme = createTheme({
  cssVariables: true,
  defaultColorScheme: "light",
  colorSchemes: { light: true, dark: true },
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
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
      <div className="theme">
        <div className="theme-header">
          <Header />
        </div>
        <div className="theme-container">{children}</div>
        <div className="theme-footer">
          <Footer />
        </div>
      </div>
      {children}
    </ThemeProvider>
  );
}
