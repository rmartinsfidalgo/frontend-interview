import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Divider from "@mui/material/Divider";

import {
  getNotification,
  updateNotificationStatus,
  type Notification,
} from "@apis";
import {
  Alert,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  type AlertProps,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { isoToLocalDateTime } from "@utils";
import StatusInput from "@notifications/notifications-toolbar/status-input";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2" component="dt" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0 }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

type NotificationModal = {
  id: string;
  onClose: () => void;
};
export default function NotificationModal({ id, onClose }: NotificationModal) {
  const [detail, setDetail] = useState<Notification | undefined>(undefined);
  const [alert, setAlert] = useState<AlertProps>();
  const onCloseModal = () => {
    onClose();
    setDetail(undefined);
  };
  const onUpdateStatus = useCallback(async () => {
    if (!detail) {
      return;
    }
    const { data, error } = await updateNotificationStatus({
      path: { id: detail.id },
      body: { status: detail?.status, resolutionNote: detail?.resolutionNote },
    });
    // [Todo] Define better validations for both status process and resolutionNote
    setAlert({ severity: "success", children: "Successfully updated" });
    if (error) {
      setAlert({ severity: "error", children: String(error.message) });
      return;
    }
    setDetail(data);
  }, [detail]);
  useEffect(() => {
    getNotification({ path: { id } })
      .then((r) => {
        setDetail(r.data);
      })
      // [Todo] Better error handling
      .catch((e) => setAlert({ severity: "error", children: e.message }));
  }, [id]);

  return (
    <div>
      <Modal
        open={!!id}
        onClose={onCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80vw",
            height: "80vh",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Grid
            container
            sx={{
              borderBottom: 1,
              paddingBottom: 1,
              justifyContent: "space-between",
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Notification Info
            </Typography>
            <CloseIcon onClick={onCloseModal} sx={{ cursor: "pointer" }} />
          </Grid>
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {detail ? (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Field label="ID" value={detail.id} />
                <Field label="Title" value={detail.title} />
                <Grid container spacing={10}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <StatusInput
                      status={detail.status}
                      setStatus={(status) => setDetail({ ...detail, status })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field label="Severity" value={detail.severity} />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      label="Created at"
                      value={isoToLocalDateTime(detail.createdAt)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      label="Updated at"
                      value={isoToLocalDateTime(detail.updatedAt)}
                    />{" "}
                  </Grid>
                </Grid>
                <Field label="Description" value={detail.description} />
                <Divider sx={{ marginBlock: 5 }} />
                <Grid sx={{ marginTop: 2 }}>
                  <TextField
                    label="Resolution Note"
                    multiline
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    rows={4}
                    fullWidth
                    placeholder="Resolution Note..."
                    defaultValue={detail.resolutionNote}
                    //[Todo] Add debounce
                    onChange={(e) =>
                      setDetail({ ...detail, resolutionNote: e.target.value })
                    }
                  />
                </Grid>
              </Stack>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress aria-label="Loading…" />
              </Box>
            )}
          </Box>
          <Grid
            sx={{
              display: "flex",
              height: 60,
              borderTop: 1,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="outlined"
              color="success"
              onClick={() => onUpdateStatus()}
            >
              Update Status
            </Button>
            <Button
              onClick={onCloseModal}
              variant="outlined"
              size="medium"
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          </Grid>

          {alert && <Alert {...alert} onClick={() => setAlert(undefined)} />}
        </Box>
      </Modal>
    </div>
  );
}
