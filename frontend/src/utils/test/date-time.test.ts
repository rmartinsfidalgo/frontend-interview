import { describe, expect, it } from "vitest";
import { isoToLocalDateTime } from "../date-time";

describe("isoToLocalDateTime", () => {
  it("formats a valid ISO string as 'YYYY-MM-DD HH:mm' in local time", () => {
    const iso = new Date(2026, 0, 5, 9, 7).toISOString();
    expect(isoToLocalDateTime(iso)).toBe("2026-01-05 09:07");
  });

  it("zero-pads month, day, hour and minute", () => {
    const iso = new Date(2026, 2, 3, 4, 5).toISOString();
    expect(isoToLocalDateTime(iso)).toBe("2026-03-03 04:05");
  });

  it("uses 24-hour time", () => {
    const iso = new Date(2026, 10, 11, 23, 59).toISOString();
    expect(isoToLocalDateTime(iso)).toBe("2026-11-11 23:59");
  });

  it("drops seconds", () => {
    const iso = new Date(2026, 10, 11, 12, 30, 45).toISOString();
    expect(isoToLocalDateTime(iso)).toBe("2026-11-11 12:30");
  });

  it.each([undefined, null, ""])("returns '-' for empty input (%s)", (input) => {
    expect(isoToLocalDateTime(input)).toBe("-");
  });

  it.each(["not-a-date", "2026-13-45T99:99:99Z"])(
    "returns '-' for an invalid date (%s)",
    (input) => {
      expect(isoToLocalDateTime(input)).toBe("-");
    },
  );
});
