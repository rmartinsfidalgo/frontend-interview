import { Chip, Stack, TableCell, TableRow, useTheme } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNotifications } from "@notifications/notifications-service";
import { TableVirtuoso, type TableVirtuosoHandle } from "react-virtuoso";
import NotificationTableComponent from "./notifications-table-component";

import { useRef, useState } from "react";
import NotificationModal from "./notification-modal";
import NotificationCard from "./notification-card";
import usePrependAnchor from "./use-prepend-anchor";

export default function NotificationList() {
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | undefined
  >();
  const { notifications, metadata, onRequestNextPage } = useNotifications();
  const { palette } = useTheme();

  const virtuosoRef = useRef<TableVirtuosoHandle>(null);
  const [atTop, setAtTop] = useState(true);
  const { firstItemIndex, newAboveCount } = usePrependAnchor(
    notifications,
    atTop,
  );

  return (
    <Stack sx={{ flex: 1, position: "relative" }}>
      {newAboveCount > 0 && (
        <Chip
          color="primary"
          icon={<ArrowUpwardIcon />}
          label={`${newAboveCount} new notification${newAboveCount > 1 ? "s" : ""}`}
          onClick={() =>
            virtuosoRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          sx={{
            position: "absolute",
            top: 64,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            boxShadow: 3,
          }}
        />
      )}
      <TableVirtuoso
        ref={virtuosoRef}
        data={notifications}
        firstItemIndex={firstItemIndex}
        computeItemKey={(_, row) => row.id}
        atTopStateChange={setAtTop}
        atTopThreshold={50}
        endReached={onRequestNextPage}
        increaseViewportBy={{ top: 0, bottom: 400 }}
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
