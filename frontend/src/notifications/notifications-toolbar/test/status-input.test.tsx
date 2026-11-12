import type { NotificationStatus } from "@apis";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ALL_STATUSES } from "../../../test/api-enums";
import StatusInput from "../status-input";

const openDropdown = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: "Status" }));
  const listbox = screen.getByRole("listbox");
  const labels = within(listbox)
    .getAllByRole("option")
    .map((o) => o.textContent);
  return { user, listbox, labels };
};

const apiLabels = () => ALL_STATUSES.map((s) => s.toLowerCase()).sort();

describe("StatusInput", () => {
  it("renders a labelled Status dropdown", () => {
    render(<StatusInput status={undefined} setStatus={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: "Status" })).toBeInTheDocument();
  });

  it("shows the currently selected status", () => {
    render(<StatusInput status="IN_PROGRESS" setStatus={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent(
      "in_progress",
    );
  });

  describe("clearable (filter mode)", () => {
    it("lists every API status exactly once, plus the clear option", async () => {
      render(<StatusInput clearable status={undefined} setStatus={vi.fn()} />);
      const { labels } = await openDropdown();

      expect(labels).toHaveLength(ALL_STATUSES.length + 1);
      expect(labels).toContain("-");
      expect(labels.filter((l) => l !== "-").sort()).toEqual(apiLabels());
    });

    it.each(ALL_STATUSES)(
      "calls setStatus with the API value %s when selected",
      async (status) => {
        const setStatus = vi.fn();
        render(<StatusInput clearable status={undefined} setStatus={setStatus} />);
        const { user, listbox } = await openDropdown();

        await user.click(
          within(listbox).getByRole("option", { name: status.toLowerCase() }),
        );

        expect(setStatus).toHaveBeenCalledExactlyOnceWith(status);
      },
    );

    it("clears the filter (undefined) when '-' is selected", async () => {
      const setStatus = vi.fn();
      render(<StatusInput clearable status="OPEN" setStatus={setStatus} />);
      const { user, listbox } = await openDropdown();

      await user.click(within(listbox).getByRole("option", { name: "-" }));

      expect(setStatus).toHaveBeenCalledExactlyOnceWith(undefined);
    });
  });

  describe("not clearable", () => {
    it("lists every API status exactly once, without the clear option", async () => {
      render(<StatusInput status="OPEN" setStatus={vi.fn()} />);
      const { labels } = await openDropdown();

      expect(labels).not.toContain("-");
      expect([...labels].sort()).toEqual(apiLabels());
    });

    it.each(ALL_STATUSES.filter((s): s is NotificationStatus => s !== "OPEN"))(
      "calls setStatus with the API value %s when selected",
      async (status) => {
        const setStatus = vi.fn();
        render(<StatusInput status="OPEN" setStatus={setStatus} />);
        const { user, listbox } = await openDropdown();

        await user.click(
          within(listbox).getByRole("option", { name: status.toLowerCase() }),
        );

        expect(setStatus).toHaveBeenCalledExactlyOnceWith(status);
      },
    );
  });
});
