import type { Notification } from "@apis";
import { TableCell, Stack } from "@mui/material";
import { isoToLocalDateTime } from "@utils";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface NotificationCardProps extends Notification {
  onSelectNotification: (id: string) => void;
}

export default function NotificationCard({
  onSelectNotification,
  ...notification
}: NotificationCardProps) {
  return (
    <>
      <TableCell>{notification.title}</TableCell>
      <TableCell>
        <Stack>
          <Stack>Created: {isoToLocalDateTime(notification.createdAt)}</Stack>
          <Stack>Updated: {isoToLocalDateTime(notification.createdAt)}</Stack>
        </Stack>
      </TableCell>
      <TableCell>{notification.status}</TableCell>
      <TableCell
        width="100px"
        onClick={() => onSelectNotification(notification.id)}
      >
        <ArrowForwardIcon
          fontSize="large"
          sx={{ borderRadius: 1, border: 1 }}
        />
      </TableCell>
    </>
  );
}
