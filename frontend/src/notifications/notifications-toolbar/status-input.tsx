import type { NotificationStatus } from "@apis";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const statusOptions: NotificationStatus[] = ["IN_PROGRESS", "OPEN", "RESOLVED"];

// `clearable` adds a "-" option that resets the value to `undefined` (used for filters).
// Without it, a status must always be selected (e.g. editing a notification).
type StatusInputProps =
  | {
      clearable: true;
      status: NotificationStatus | undefined;
      setStatus: (status: NotificationStatus | undefined) => void;
    }
  | {
      clearable?: false;
      status: NotificationStatus | undefined;
      setStatus: (status: NotificationStatus) => void;
    };

export default function StatusInput(props: StatusInputProps) {
  const { status } = props;
  return (
    <FormControl fullWidth>
      <InputLabel id="status-select-label">Status</InputLabel>
      <Select
        labelId="status-select-label"
        id="status-select"
        label="Status"
        value={status ?? ""}
        onChange={(e) => {
          const value = e.target.value as NotificationStatus | "";
          if (props.clearable) {
            props.setStatus(value || undefined);
          } else if (value) {
            props.setStatus(value);
          }
        }}
      >
        {props.clearable && <MenuItem value="">-</MenuItem>}
        {statusOptions.map((s) => (
          <MenuItem key={s} value={s}>
            {s.toLowerCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
