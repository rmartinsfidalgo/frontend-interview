import { Stack } from "@mui/material";
import NotificationsToolbar from "./notifications-toolbar/notifications-toolbar";
import { NotificationsList } from "./notification-list";
import NotificationProvider from "./notifications-service/notifications-provider";

export default function Notifications() {
  return (
    <NotificationProvider>
      <Stack spacing={2} sx={{ flex: 1, m: 2 }}>
        <NotificationsToolbar />
        <NotificationsList />
      </Stack>
    </NotificationProvider>
  );
}
