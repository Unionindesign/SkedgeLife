import { buildTimetable, comingUp, describeChange } from "../timetable";
import type { EventWithVenue, OccurrenceWithEvent } from "../events";

const weekly = (id: string, days: number[], start: string) =>
  ({ id, title: id, weekly_days: days, local_start_time: start, venue_id: "v", format: "in_person" }) as EventWithVenue;

describe("buildTimetable", () => {
  it("groups weekly events by weekday, Monday first, sorted by time", () => {
    const days = buildTimetable([
      weekly("late", [5], "19:30:00"),
      weekly("early", [5, 6], "08:30:00"),
      weekly("sun", [0], "10:00:00"),
    ]);
    expect(days.map((d) => d.weekday)).toEqual([5, 6, 0]);
    expect(days[0].events.map((e) => e.id)).toEqual(["early", "late"]);
  });

  it("leaves out days with nothing on", () => {
    expect(buildTimetable([])).toEqual([]);
  });
});

const now = new Date("2026-10-18T12:00:00Z");
const occ = (overrides: Partial<OccurrenceWithEvent>) =>
  ({
    status: "scheduled",
    is_modified: false,
    starts_at: "2026-10-20T16:00:00Z",
    original_starts_at: "2026-10-20T16:00:00Z",
    title: null,
    venue_id: null,
    venue: null,
    format: null,
    event: { title: "Hot Ra", weekly_days: [2], venue_id: "v", format: "in_person", venue: null },
    ...overrides,
  }) as OccurrenceWithEvent;

describe("comingUp", () => {
  it("lists one-offs in the next eight weeks", () => {
    const soon = occ({ event: { ...occ({}).event, weekly_days: null } });
    const later = occ({ starts_at: "2027-03-01T16:00:00Z", event: { ...occ({}).event, weekly_days: null } });
    expect(comingUp([soon, later], now).oneOffs).toEqual([soon]);
  });

  it("lists cancelled or changed weekly dates in the next two weeks only", () => {
    const cancelled = occ({ status: "cancelled" });
    const unchanged = occ({});
    const farChange = occ({ is_modified: true, starts_at: "2026-11-20T16:00:00Z" });
    expect(comingUp([cancelled, unchanged, farChange], now).changes).toEqual([cancelled]);
  });
});

describe("describeChange", () => {
  it("says what changed", () => {
    expect(describeChange(occ({ status: "cancelled" }))).toBe("Cancelled");
    expect(describeChange(occ({ is_modified: true, starts_at: "2026-10-20T17:00:00Z" }))).toBe("New time");
    expect(describeChange(occ({ is_modified: true, title: "Hot Ra (sub: Jen)" }))).toBe("Hot Ra (sub: Jen)");
  });
});
