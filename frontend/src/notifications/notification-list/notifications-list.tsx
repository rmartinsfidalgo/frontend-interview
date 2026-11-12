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
  const { notifications, metadata, onRequestNextPage } = useNotifications();
  const { palette } = useTheme();

  return (
    <Stack sx={{ flex: 1 }}>
      <TableVirtuoso
        data={notifications}
        rangeChanged={({ endIndex }) => {
          const total = notifications?.length ?? 0;
          if (total > 0 && endIndex >= Math.floor(total * 0.8)) {
            onRequestNextPage();
          }
        }}
        components={NotificationTableComponent}
        fixedHeaderContent={() => (
          <TableRow sx={{ bgcolor: palette.background.paper }}>
            <TableCell>Title ({metadata?.totalElements})</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            {/* Fixed table layout sizes columns from this header row; others share the rest */}
            <TableCell sx={{ width: 80 }} align="center">
              Action
            </TableCell>
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
