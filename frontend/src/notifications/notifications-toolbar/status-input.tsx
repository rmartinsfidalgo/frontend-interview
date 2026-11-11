import type { NotificationStatus } from "@apis";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import useNotifications from "../notifications-service/use-notifications";

const statusOptions: NotificationStatus[] = ["IN_PROGRESS", "OPEN", "RESOLVED"];
type StatusInputProps = {
  status: NotificationStatus;
  setStatus: (status: NotificationStatus) => void;
};
export default function StatusInput({ status, setStatus }: StatusInputProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">Status</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        label="status"
        value={status}
        onChange={(e) => setStatus(e.target.value || undefined)}
      >
        <MenuItem>-</MenuItem>
        {statusOptions.map((s) => (
          <MenuItem value={s}>{s.toLowerCase()}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
