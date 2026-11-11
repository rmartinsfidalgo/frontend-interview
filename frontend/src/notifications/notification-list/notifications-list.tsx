import { Stack, TableCell, TableRow, useTheme } from "@mui/material";
import { useNotifications } from "@notifications/notifications-service";
import { TableVirtuoso } from "react-virtuoso";
import NotificationTableComponent from "./notifications-table-component";

import { useState } from "react";
import NotificationModal from "./notification-modal";
import NotificationCard from "./notification-card";

export default function NotificationList() {
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | undefined
  >();
  const { notifications } = useNotifications();
  const { palette } = useTheme();

  return (
    <Stack sx={{ flex: 1 }}>
      <TableVirtuoso
        data={notifications}
        components={NotificationTableComponent}
        fixedHeaderContent={() => (
          <TableRow sx={{ bgcolor: palette.background.paper }}>
            <TableCell>Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        )}
        itemContent={(_, row) => (
          <NotificationCard
            {...row}
            onSelectNotification={setSelectedNotificationId}
          />
        )}
      />
      {selectedNotificationId && (
        <NotificationModal
          id={selectedNotificationId}
          onClose={() => setSelectedNotificationId(undefined)}
        />
      )}
    </Stack>
  );
}
