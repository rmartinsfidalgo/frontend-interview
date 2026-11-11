import type { NotificationSeverity } from "@apis";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useNotifications } from "@notifications/notifications-service";

const severityOptions: NotificationSeverity[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

export default function SeverityInput() {
  const { severity, setSeveriity } = useNotifications();
  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">Severity</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        label="Severity"
        value={severity}
        onChange={(e) => setSeveriity(e.target.value || undefined)}
      >
        <MenuItem>-</MenuItem>
        {severityOptions.map((s) => (
          <MenuItem value={s}>{s.toLowerCase()}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
