import type { SkedgeLifeClient } from "./client";
import type { EventWithVenue, OccurrenceWithEvent } from "./events";
import { dateDetails } from "./events";
import { todayIn } from "./time";

// The public website's schedule: a weekly timetable of classes, plus what's
// coming up that the timetable can't show (one-off events, and changes to
// weekly classes in the next two weeks).

// A profile's public weekly events that are still running.
export async function getPublicWeeklyEvents(client: SkedgeLifeClient, profileId: string): Promise<EventWithVenue[]> {
  const { data, error } = await client
    .from("events")
    .select("*, venue:venues(*)")
    .eq("profile_id", profileId)
    .eq("status", "scheduled")
    .eq("visibility", "public")
    .not("weekly_days", "is", null)
    .order("local_start_time");
  if (error) throw error;
  return (data as EventWithVenue[]).filter((e) => !e.repeat_until || e.repeat_until >= todayIn(e.time_zone));
}

export type TimetableDay = { weekday: number; events: EventWithVenue[] };

// Weekly events by weekday, Monday first, each day sorted by start time. Days
// with nothing on are left out.
export function buildTimetable(events: EventWithVenue[]): TimetableDay[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order
    .map((weekday) => ({
      weekday,
      events: events
        .filter((e) => e.weekly_days?.includes(weekday))
        .sort((a, b) => (a.local_start_time ?? "").localeCompare(b.local_start_time ?? "")),
    }))
    .filter((day) => day.events.length > 0);
}

const DAY_MS = 86_400_000;

// From the upcoming dates: one-off events in the next `oneOffWeeks`, and weekly
// classes that are cancelled or changed in the next `changeDays`.
export function comingUp(
  occurrences: OccurrenceWithEvent[],
  now: Date = new Date(),
  oneOffWeeks = 8,
  changeDays = 14,
): { oneOffs: OccurrenceWithEvent[]; changes: OccurrenceWithEvent[] } {
  const before = (days: number) => (o: OccurrenceWithEvent) =>
    new Date(o.starts_at).getTime() < now.getTime() + days * DAY_MS;
  return {
    oneOffs: occurrences
      .filter((o) => !o.event.weekly_days && o.status === "scheduled")
      .filter(before(oneOffWeeks * 7)),
    changes: occurrences
      .filter((o) => o.event.weekly_days && (o.status === "cancelled" || o.is_modified))
      .filter(before(changeDays)),
  };
}

// What changed on a weekly date, in a few words: "Cancelled", or "Moved",
// "New title", and the like.
export function describeChange(o: OccurrenceWithEvent): string {
  if (o.status === "cancelled") return "Cancelled";
  const d = dateDetails(o);
  const parts: string[] = [];
  if (o.starts_at !== o.original_starts_at) parts.push("New time");
  if (o.title && o.title !== o.event.title) parts.push(d.title);
  if (o.venue_id && o.venue_id !== o.event.venue_id) parts.push(`at ${d.venue?.name ?? "a different place"}`);
  if (o.format === "online" && o.event.format !== "online") parts.push("online");
  return parts.length > 0 ? parts.join(" · ") : "Changed";
}
