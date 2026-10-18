import type { OccurrenceWithEvent } from "@skedgelife/data";
import { dayOf, isCancelled } from "../OccurrenceRow";

jest.mock("../../../lib/supabase", () => ({ supabase: {} }));

const item = (overrides: Partial<OccurrenceWithEvent> = {}) =>
  ({
    starts_at: "2026-10-24T02:30:00Z", // Friday 7:30 PM in Los Angeles, Saturday in UTC
    status: "scheduled",
    format: null,
    time_zone: null,
    venue_id: null,
    venue: null,
    event: { format: "in_person", time_zone: "America/Los_Angeles", status: "scheduled", venue: null },
    ...overrides,
  }) as unknown as OccurrenceWithEvent;

describe("dayOf", () => {
  // An in-person class sits on the day it happens where it happens.
  it("uses the event's own zone for in-person dates", () => {
    expect(dayOf(item())).toBe("2026-10-23");
  });
});

describe("isCancelled", () => {
  it("is true when the date or the whole event is cancelled", () => {
    expect(isCancelled(item())).toBe(false);
    expect(isCancelled(item({ status: "cancelled" }))).toBe(true);
    expect(isCancelled(item({ event: { ...item().event, status: "cancelled" } }))).toBe(true);
  });
});
