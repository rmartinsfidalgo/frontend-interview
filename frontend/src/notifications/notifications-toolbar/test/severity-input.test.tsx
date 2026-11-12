import type { NotificationSeverity } from "@apis";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { ALL_SEVERITIES } from "../../../test/api-enums";
import NotificationsContext from "../../notifications-service/notifications-context";
import SeverityInput from "../severity-input";

type ContextValue = NonNullable<
  ComponentProps<typeof NotificationsContext.Provider>["value"]
>;

const renderSeverityInput = (severity?: NotificationSeverity) => {
  const setSeveriity = vi.fn();
  const value = {
    notifications: [],
    setNotifications: vi.fn(),
    status: undefined,
    setStatus: vi.fn(),
    severity,
    setSeveriity,
    metadata: undefined,
    setMetadata: vi.fn(),
    onRequestNextPage: vi.fn(),
  } satisfies ContextValue;

  render(
    <NotificationsContext.Provider value={value}>
      <SeverityInput />
    </NotificationsContext.Provider>,
  );
  return { setSeveriity };
};

const openDropdown = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: "Severity" }));
  return { user, listbox: screen.getByRole("listbox") };
};

describe("SeverityInput", () => {
  it("renders a labelled Severity dropdown", () => {
    renderSeverityInput();
    expect(screen.getByRole("combobox", { name: "Severity" })).toBeInTheDocument();
  });

  it("lists every API severity exactly once, plus the clear option", async () => {
    renderSeverityInput();
    const { listbox } = await openDropdown();

    const labels = within(listbox)
      .getAllByRole("option")
      .map((o) => o.textContent);

    expect(labels).toHaveLength(ALL_SEVERITIES.length + 1);
    expect(labels).toContain("-");
    expect(labels.filter((l) => l !== "-").sort()).toEqual(
      ALL_SEVERITIES.map((s) => s.toLowerCase()).sort(),
    );
  });

  it.each(ALL_SEVERITIES)(
    "calls setSeveriity with the API value %s when selected",
    async (severity) => {
      const { setSeveriity } = renderSeverityInput();
      const { user, listbox } = await openDropdown();

      await user.click(
        within(listbox).getByRole("option", { name: severity.toLowerCase() }),
      );

      expect(setSeveriity).toHaveBeenCalledExactlyOnceWith(severity);
    },
  );

  it("clears the filter (undefined) when '-' is selected", async () => {
    const { setSeveriity } = renderSeverityInput("HIGH");
    const { user, listbox } = await openDropdown();

    await user.click(within(listbox).getByRole("option", { name: "-" }));

    expect(setSeveriity).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it("shows the currently selected severity", () => {
    renderSeverityInput("CRITICAL");
    expect(screen.getByRole("combobox", { name: "Severity" })).toHaveTextContent(
      "critical",
    );
  });
});
