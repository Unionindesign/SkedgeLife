import type { Database } from "@skedgelife/types";
import type { SkedgeLifeClient } from "./client";
import { deviceTimeZone, todayIn } from "./time";

type Tables = Database["public"]["Tables"];
export type EventRow = Tables["events"]["Row"];
export type VenueRow = Tables["venues"]["Row"];
export type OccurrenceRow = Tables["event_occurrences"]["Row"];
export type EventWithVenue = EventRow & { venue: VenueRow | null };
export type OccurrenceWithEvent = OccurrenceRow & { event: EventWithVenue };

// The event columns a host fills in; status changes go through setEventStatus.
export type EventFields = Omit<Tables["events"]["Insert"], "id" | "profile_id" | "status" | "created_at" | "updated_at">;
export type VenueFields = Pick<Tables["venues"]["Insert"], "name" | "address" | "time_zone" | "booking_url" | "is_private">;

// Matches public.enforce_event_caps() in the scheduling_real_times migration.
export const EVENT_CAPS = { weeklySlots: 3, largerPerMonth: 1, largerOver: 20 } as const;

export function isLargerEvent(capacity: number | null | undefined) {
  return capacity == null || capacity > EVENT_CAPS.largerOver;
}

// Weekly events still running, which each use one of the free plan's slots.
export function activeWeeklyEvents(events: EventRow[]) {
  return events.filter(
    (e) => e.status === "scheduled" && e.weekly_days && (!e.repeat_until || e.repeat_until >= todayIn(e.time_zone)),
  );
}

// In-person events show in their own zone (that's where you'll be); online
// events show in the viewer's zone. docs/rules/time.md, rule 7.
export function displayTimeZone(event: Pick<EventRow, "format" | "time_zone">) {
  return event.format === "online" ? deviceTimeZone() : event.time_zone;
}

const EVENT_SELECT = "*, venue:venues(*)" as const;

// A profile's upcoming dates, soonest first ("upcoming" by the server's clock).
export async function getUpcomingOccurrences(client: SkedgeLifeClient, profileId: string): Promise<OccurrenceWithEvent[]> {
  const { data, error } = await client
    .rpc("upcoming_occurrences", { p_profile_id: profileId })
    .select(`*, event:events(${EVENT_SELECT})`);
  if (error) throw error;
  return (data ?? []) as unknown as OccurrenceWithEvent[];
}

export async function getEvent(client: SkedgeLifeClient, id: string): Promise<EventWithVenue | null> {
  const { data, error } = await client.from("events").select(EVENT_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as EventWithVenue | null;
}

export async function listMyEvents(client: SkedgeLifeClient, profileId: string): Promise<EventRow[]> {
  const { data, error } = await client.from("events").select("*").eq("profile_id", profileId);
  if (error) throw error;
  return data;
}

// Places the user has added, for picking when creating an event.
export async function listMyVenues(client: SkedgeLifeClient, userId: string): Promise<VenueRow[]> {
  const { data, error } = await client.from("venues").select("*").eq("created_by", userId).order("name");
  if (error) throw error;
  return data;
}

export async function createVenue(client: SkedgeLifeClient, userId: string, fields: VenueFields): Promise<VenueRow> {
  const { data, error } = await client
    .from("venues")
    .insert({ ...fields, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createEvent(client: SkedgeLifeClient, profileId: string, fields: EventFields): Promise<string> {
  const { data, error } = await client
    .from("events")
    .insert({ ...fields, profile_id: profileId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateEvent(client: SkedgeLifeClient, id: string, fields: EventFields) {
  const { error } = await client.from("events").update(fields).eq("id", id);
  if (error) throw error;
}

// Cancelling an event cancels all its upcoming dates.
export async function setEventStatus(client: SkedgeLifeClient, id: string, status: "scheduled" | "cancelled") {
  const { error } = await client.from("events").update({ status }).eq("id", id);
  if (error) throw error;
}

// Cancels or restores one date.
export async function setOccurrenceStatus(client: SkedgeLifeClient, id: string, status: "scheduled" | "cancelled") {
  const { error } = await client.from("event_occurrences").update({ status }).eq("id", id);
  if (error) throw error;
}
