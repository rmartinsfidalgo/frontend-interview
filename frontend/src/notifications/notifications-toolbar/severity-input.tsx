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
      <InputLabel id="severity-select-label">Severity</InputLabel>
      <Select
        labelId="severity-select-label"
        id="severity-select"
        label="Severity"
        value={severity ?? ""}
        onChange={(e) =>
          setSeveriity(
            (e.target.value || undefined) as NotificationSeverity | undefined,
          )
        }
      >
        <MenuItem value="">-</MenuItem>
        {severityOptions.map((s) => (
          <MenuItem key={s} value={s}>
            {s.toLowerCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
