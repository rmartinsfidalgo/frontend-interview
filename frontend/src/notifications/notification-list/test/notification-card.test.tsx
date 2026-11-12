import type { Notification } from "@apis";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { isoToLocalDateTime } from "@utils";
import NotificationCard from "../notification-card";

const baseNotification: Notification = {
  id: "n-1",
  title: "Database latency spike",
  description: "p99 latency above 2s",
  severity: "CRITICAL",
  status: "OPEN",
  resolutionNote: null,
  createdAt: "2026-11-11T09:00:00.000Z",
  updatedAt: "2026-11-11T09:30:00.000Z",
};

// NotificationCard renders <td> cells only, so it must live inside a table row
const renderCard = (
  overrides: Partial<Notification> = {},
  onSelectNotification = vi.fn(),
) => {
  const notification = { ...baseNotification, ...overrides };
  render(
    <table>
      <tbody>
        <tr>
          <NotificationCard
            {...notification}
            onSelectNotification={onSelectNotification}
          />
        </tr>
      </tbody>
    </table>,
  );
  return { notification, onSelectNotification };
};

describe("NotificationCard", () => {
  it("renders title, severity, status and both dates", () => {
    const { notification } = renderCard();
    const row = screen.getByRole("row");

    expect(within(row).getByText(notification.title)).toBeInTheDocument();
    expect(within(row).getByText("CRITICAL")).toBeInTheDocument();
    expect(within(row).getByText("OPEN")).toBeInTheDocument();
    expect(row).toHaveTextContent(
      `Created: ${isoToLocalDateTime(notification.createdAt)}`,
    );
    expect(row).toHaveTextContent(
      `Updated: ${isoToLocalDateTime(notification.updatedAt)}`,
    );
  });

  it("renders one cell per table column", () => {
    renderCard();
    // Must match the 5 header columns in NotificationList
    expect(screen.getAllByRole("cell")).toHaveLength(5);
  });

  // Severity colour is the main "at a glance" signal, so we assert the MUI colour class
  it.each([
    ["CRITICAL", "MuiChip-colorError"],
    ["HIGH", "MuiChip-colorWarning"],
    ["MEDIUM", "MuiChip-colorInfo"],
    ["LOW", "MuiChip-colorSuccess"],
  ] as const)("shows %s severity with %s", (severity, colorClass) => {
    renderCard({ severity });
    const chip = screen.getByText(severity).closest(".MuiChip-root");
    expect(chip).toHaveClass(colorClass);
  });

  it("calls onSelectNotification with the id when the action cell is clicked", async () => {
    const user = userEvent.setup();
    const { onSelectNotification } = renderCard({ id: "n-42" });

    const actionCell = screen.getAllByRole("cell").at(-1)!;
    await user.click(actionCell);

    expect(onSelectNotification).toHaveBeenCalledTimes(1);
    expect(onSelectNotification).toHaveBeenCalledWith("n-42");
  });

  it("does not select the notification when another cell is clicked", async () => {
    const user = userEvent.setup();
    const { notification, onSelectNotification } = renderCard();

    await user.click(screen.getByText(notification.title));

    expect(onSelectNotification).not.toHaveBeenCalled();
  });
});
