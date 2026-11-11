import { Grid } from "@mui/material";
import SeverityInput from "./severity-input";
import StatusInput from "./status-input";

export default function NotificationsToolbar() {
  return (
    <Grid
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#eee",
        border: "1px solid #000000",
        boxShadow: "none",
        color: "#000",
      }}
    >
      <Grid container spacing={2}>
        <Grid size={4}>
          <SeverityInput />
        </Grid>
        <Grid size={4}>
          <StatusInput />
        </Grid>
      </Grid>
    </Grid>
  );
}
