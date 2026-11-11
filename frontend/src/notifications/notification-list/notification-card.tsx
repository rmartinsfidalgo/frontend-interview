import type { Notification } from "@apis";
import { TableCell, Stack, Chip, type ChipProps } from "@mui/material";
import { isoToLocalDateTime } from "@utils";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useMemo } from "react";

interface NotificationCardProps extends Notification {
  onSelectNotification: (id: string) => void;
}

export default function NotificationCard({
  onSelectNotification,
  ...notification
}: NotificationCardProps) {
  const severityColor = useMemo<ChipProps["color"]>(() => {
    switch (notification.severity?.toLowerCase()) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  }, [notification.severity]);
  return (
    <>
      <TableCell>{notification.title}</TableCell>
      <TableCell>
        <Chip
          variant="outlined"
          label={notification.severity}
          color={severityColor}
        />
      </TableCell>
      <TableCell>{notification.status}</TableCell>
      <TableCell>
        <Stack>
          <Stack>Created: {isoToLocalDateTime(notification.createdAt)}</Stack>
          <Stack>Updated: {isoToLocalDateTime(notification.updatedAt)}</Stack>
        </Stack>
      </TableCell>
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
