import { AppBar, Typography } from "@mui/material";

export default function Footer() {
  return (
    <AppBar
      component="footer"
      position="static"
      sx={{ height: 40, p: 2, justifyContent: "center" }}
    >
      <Typography sx={{ textAlign: "left", fontSize: "80%" }}>
        Copyright AB Volvo 2026
      </Typography>
    </AppBar>
  );
}
