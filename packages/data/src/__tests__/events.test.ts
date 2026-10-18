import { activeWeeklyEvents, dateDetails, isLargerEvent, type EventRow, type OccurrenceWithEvent, type VenueRow } from "../events";

const venue = (id: string, time_zone = "America/Los_Angeles") =>
  ({ id, name: `Venue ${id}`, time_zone, is_private: false }) as VenueRow;

const event = (overrides: Partial<EventRow> = {}) =>
  ({
    id: "e1",
    title: "Hot Ra",
    description: null,
    format: "in_person",
    venue_id: "studio",
    online_url: null,
    time_zone: "America/Los_Angeles",
    capacity: null,
    booking_mode: "external_link",
    booking_url: "https://studio.example",
    is_private_home: false,
    area: null,
    status: "scheduled",
    weekly_days: [6],
    repeat_until: null,
    ...overrides,
  }) as EventRow;

const occurrence = (overrides: Partial<OccurrenceWithEvent> = {}): OccurrenceWithEvent =>
  ({
    id: "o1",
    status: "scheduled",
    is_modified: false,
    title: null,
    description: null,
    format: null,
    venue_id: null,
    online_url: null,
    time_zone: null,
    capacity: null,
    booking_mode: null,
    booking_url: null,
    is_private_home: null,
    area: null,
    venue: null,
    event: { ...event(), venue: venue("studio") },
    ...overrides,
  }) as OccurrenceWithEvent;

describe("dateDetails", () => {
  it("uses the event's details when the date has no changes", () => {
    const d = dateDetails(occurrence());
    expect(d.title).toBe("Hot Ra");
    expect(d.venue?.id).toBe("studio");
    expect(d.booking_url).toBe("https://studio.example");
  });

  it("lets a date's own changes win, field by field", () => {
    const d = dateDetails(
      occurrence({ title: "Hot Ra (sub: Jen)", venue_id: "other", venue: venue("other", "America/Denver"), time_zone: "America/Denver" }),
    );
    expect(d.title).toBe("Hot Ra (sub: Jen)");
    expect(d.venue?.id).toBe("other");
    expect(d.time_zone).toBe("America/Denver");
    // Unchanged fields still come from the event.
    expect(d.booking_url).toBe("https://studio.example");
  });

  it("drops the venue for a date moved online", () => {
    const d = dateDetails(occurrence({ format: "online", online_url: "https://meet.example" }));
    expect(d.format).toBe("online");
    expect(d.venue).toBeNull();
    expect(d.online_url).toBe("https://meet.example");
  });
});

describe("caps mirror", () => {
  // Matches public.is_larger_event().
  it("counts over 20 people, or no limit, as a larger event", () => {
    expect(isLargerEvent(null)).toBe(true);
    expect(isLargerEvent(21)).toBe(true);
    expect(isLargerEvent(20)).toBe(false);
  });

  it("counts weekly events that are still running", () => {
    const events = [
      event({ id: "a" }),
      event({ id: "b", status: "cancelled" }),
      event({ id: "c", repeat_until: "2000-01-01" }),
      event({ id: "d", weekly_days: null }),
    ];
    expect(activeWeeklyEvents(events).map((e) => e.id)).toEqual(["a"]);
  });
});
