import React, { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  COMMON_TIME_ZONES,
  WEEKDAYS_SHORT,
  activeWeeklyEvents,
  addDaysToDate,
  addMinutesToClock,
  createEvent,
  createVenue,
  dateDetails,
  deviceTimeZone,
  formatDate,
  getEvent,
  getOccurrence,
  listMyEvents,
  listMyVenues,
  localToUtcIso,
  minutesBetween,
  resetOccurrence,
  setEventStatus,
  setOccurrenceStatus,
  todayIn,
  updateEvent,
  updateOccurrence,
  utcToLocal,
  zoneLabel,
  EVENT_CAPS,
  type EventFields,
  type EventRow,
  type EventWithVenue,
  type OccurrenceFields,
  type OccurrenceWithEvent,
  type ProfilePage,
  type VenueRow,
} from "@skedgelife/data";
import { getSkin } from "@skedgelife/skins";
import type { MainStackParamList } from "../navigation/RootNavigator";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import Field, { formStyles } from "../components/Field";
import Chips from "../components/Chips";
import DateTimeField from "../components/DateTimeField";
import TagEditor from "../components/TagEditor";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/errors";
import { confirm } from "../lib/confirm";

type Props = NativeStackScreenProps<MainStackParamList, "EventForm">;

// Limits match the check constraints on public.events and public.venues.
const LIMITS = { title: 120, description: 2000, area: 80, venueName: 120, address: 300, url: 500 };

type Loaded =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      event: EventWithVenue | null;
      occurrence: OccurrenceWithEvent | null;
      venues: VenueRow[];
      events: EventRow[];
    };

// "date" changes one date of a weekly event; "event" changes the event (every date).
type Scope = "date" | "event";

// Create or edit an event. Opened from a date of a weekly event, it starts on
// that date alone, with a switch to edit every date instead.
export default function EventFormScreen(props: Props) {
  const { eventId, occurrenceId } = props.route.params;
  const [scope, setScope] = useState<Scope>(occurrenceId ? "date" : "event");
  const { state, reload } = useProfile();
  const profileId = state.status === "ready" ? state.profile.id : null;
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    Promise.all([
      eventId ? getEvent(supabase, eventId) : Promise.resolve(null),
      occurrenceId ? getOccurrence(supabase, occurrenceId) : Promise.resolve(null),
      listMyVenues(supabase, profileId),
      listMyEvents(supabase, profileId),
    ])
      .then(([event, occurrence, venues, events]) => {
        if (!cancelled) setLoaded({ status: "ready", event, occurrence, venues, events });
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoaded({ status: "error", message: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, eventId, occurrenceId, attempt]);

  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;
  if (loaded.status === "error") {
    return <ProfileStatus status="error" message={loaded.message} onRetry={() => setAttempt((n) => n + 1)} />;
  }
  if (loaded.status === "loading") return <ProfileStatus status="loading" />;
  if (eventId && !loaded.event) return <ProfileStatus status="not-found" />;

  // One-off events have a single date, so editing the event is editing the date.
  const canPickScope = Boolean(loaded.occurrence && loaded.event?.weekly_days && loaded.event.status === "scheduled");
  const effectiveScope: Scope = canPickScope ? scope : "event";
  const accent = getSkin(state.profile.skin).colors.accent;
  return (
    <EventForm
      // A fresh form for each scope, since they start from different values.
      key={effectiveScope}
      {...props}
      profile={state.profile}
      {...loaded}
      scope={effectiveScope}
      scopePicker={
        canPickScope ? (
          <Field label="Change">
            <Chips
              options={[
                { value: "date", label: "This date only" },
                { value: "event", label: "Every date" },
              ]}
              selected={effectiveScope}
              onToggle={setScope}
              accentColor={accent}
            />
          </Field>
        ) : null
      }
    />
  );
}

type Form = {
  title: string;
  when: "once" | "weekly";
  date: string;
  days: number[];
  start: string;
  end: string;
  repeatUntil: string | null;
  format: "in_person" | "online";
  venueId: string | null; // null means a new place
  newVenueName: string;
  newVenueAddress: string;
  newVenuePrivate: boolean;
  area: string;
  onlineUrl: string;
  timeZone: string; // for online events and new places; a saved place brings its own
  description: string;
  kind: "class" | "meetup" | "workshop";
  capacity: string;
  bookingMode: "rsvp" | "external_link";
  bookingUrl: string;
  interests: string[];
};

function toForm(event: EventWithVenue | null, venues: VenueRow[]): Form {
  const zone = event?.time_zone ?? deviceTimeZone();
  const base: Form = {
    title: "",
    when: "once",
    date: todayIn(zone),
    days: [],
    start: "18:00",
    end: "19:00",
    repeatUntil: null,
    format: "in_person",
    venueId: venues[0]?.id ?? null,
    newVenueName: "",
    newVenueAddress: "",
    newVenuePrivate: false,
    area: "",
    onlineUrl: "",
    timeZone: zone,
    description: "",
    kind: "class",
    capacity: "",
    bookingMode: "rsvp",
    bookingUrl: "",
    interests: [],
  };
  if (!event) return base;

  const timing: Partial<Form> =
    event.weekly_days && event.local_start_time && event.duration_minutes
      ? {
          when: "weekly",
          days: event.weekly_days,
          start: event.local_start_time.slice(0, 5),
          end: addMinutesToClock(event.local_start_time.slice(0, 5), event.duration_minutes),
          repeatUntil: event.repeat_until,
        }
      : {
          when: "once",
          date: utcToLocal(event.starts_at!, zone).date,
          start: utcToLocal(event.starts_at!, zone).time,
          end: utcToLocal(event.ends_at!, zone).time,
        };
  return {
    ...base,
    ...timing,
    title: event.title,
    format: event.format === "online" ? "online" : "in_person",
    venueId: event.venue_id,
    area: event.area ?? "",
    onlineUrl: event.online_url ?? "",
    description: event.description ?? "",
    kind: event.kind as Form["kind"],
    capacity: event.capacity ? String(event.capacity) : "",
    bookingMode: event.booking_mode === "external_link" ? "external_link" : "rsvp",
    bookingUrl: event.booking_url ?? "",
    interests: event.interests,
  };
}

// A single date, as it currently is (its own changes over the event's details).
function dateToForm(occurrence: OccurrenceWithEvent, venues: VenueRow[]): Form {
  const d = dateDetails(occurrence);
  const zone = d.time_zone;
  const base = toForm(occurrence.event, venues);
  return {
    ...base,
    when: "once",
    date: utcToLocal(occurrence.starts_at, zone).date,
    start: utcToLocal(occurrence.starts_at, zone).time,
    end: utcToLocal(occurrence.ends_at, zone).time,
    title: d.title,
    format: d.format === "online" ? "online" : "in_person",
    venueId: d.venue?.id ?? occurrence.event.venue_id,
    area: d.area ?? "",
    onlineUrl: d.online_url ?? "",
    timeZone: zone,
    description: d.description ?? "",
    capacity: d.capacity ? String(d.capacity) : "",
    bookingMode: d.booking_mode === "external_link" ? "external_link" : "rsvp",
    bookingUrl: d.booking_url ?? "",
  };
}

const isUrl = (s: string) => /^https?:\/\/\S+\.\S+/.test(s.trim());

function EventForm({
  navigation,
  route,
  profile,
  event,
  occurrence,
  venues: initialVenues,
  events,
  scope,
  scopePicker,
}: Props & {
  profile: ProfilePage;
  event: EventWithVenue | null;
  occurrence: OccurrenceWithEvent | null;
  venues: VenueRow[];
  events: EventRow[];
  scope: Scope;
  scopePicker: React.ReactNode;
}) {
  const [venues, setVenues] = useState(initialVenues);
  const forDate = scope === "date" && occurrence !== null;
  const [initial] = useState(() => (forDate ? dateToForm(occurrence, initialVenues) : toForm(event, initialVenues)));
  const [form, setForm] = useState(initial);
  const [showMore, setShowMore] = useState(() => Boolean(event && (event.description || event.capacity || event.interests.length)));
  const [pickZone, setPickZone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const accent = getSkin(profile.skin).colors.accent;

  useLayoutEffect(() => {
    navigation.setOptions({ title: forDate ? "Edit date" : event ? "Edit event" : "New event" });
  }, [navigation, event, forDate]);

  const venue = form.format === "in_person" ? venues.find((v) => v.id === form.venueId) ?? null : null;
  const zone = venue ? venue.time_zone : form.timeZone;
  const isPrivateHome = form.format === "in_person" && (venue ? venue.is_private : form.newVenuePrivate);
  const today = todayIn(zone);
  const cancelledEvent = event?.status === "cancelled";

  // The free plan's weekly slots, mirroring public.enforce_event_caps(). The
  // database has the final say (one-offs also use slots in their week).
  const otherWeekly = activeWeeklyEvents(events.filter((e) => e.id !== event?.id));
  const overWeeklyCap =
    !forDate && profile.plan !== "paid" && form.when === "weekly" && otherWeekly.length >= EVENT_CAPS.weeklySlots;

  const capacity = form.capacity.trim() === "" ? null : Number(form.capacity);
  const problem = (() => {
    if (overWeeklyCap) return `The free plan allows ${EVENT_CAPS.weeklySlots} weekly events. Upgrade for no limit.`;
    if (!form.title.trim()) return "Add a title.";
    if (form.title.length > LIMITS.title) return `Keep the title under ${LIMITS.title} characters.`;
    if (form.when === "weekly" && form.days.length === 0) return "Pick at least one day.";
    if (form.when === "once" && form.date < today) return "That date has passed.";
    if (form.start === form.end) return "The end time needs to be after the start.";
    if (form.when === "weekly" && form.repeatUntil && form.repeatUntil < today) return "The end date has passed.";
    if (form.format === "in_person" && !venue && !form.newVenueName.trim()) return "Add the place's name.";
    if (form.newVenueName.length > LIMITS.venueName || form.newVenueAddress.length > LIMITS.address) return "The place's name or address is too long.";
    if (isPrivateHome && !form.area.trim()) return "Add an area to show instead of your address.";
    if (form.area.length > LIMITS.area) return `Keep the area under ${LIMITS.area} characters.`;
    if (form.format === "online" && !isUrl(form.onlineUrl)) return "Add the link people join with (starting with https://).";
    if (form.bookingMode === "external_link" && !isUrl(form.bookingUrl)) return "Add the booking link (starting with https://).";
    if (capacity !== null && !(Number.isInteger(capacity) && capacity > 0)) return "Capacity needs to be a whole number.";
    if (form.description.length > LIMITS.description) return `Keep the description under ${LIMITS.description} characters.`;
    return null;
  })();

  const changed = JSON.stringify(form) !== JSON.stringify(initial);
  const canSave = !problem && !saving && !cancelledEvent && (changed || !event);

  const toFields = (venueId: string | null): EventFields => {
    const text = (s: string) => s.trim() || null;
    const duration = minutesBetween(form.start, form.end);
    // An end at or before the start runs past midnight, into the next day.
    const endDate = form.end <= form.start ? addDaysToDate(form.date, 1) : form.date;
    const timing =
      form.when === "weekly"
        ? {
            starts_at: null,
            ends_at: null,
            weekly_days: [...form.days].sort(),
            local_start_time: form.start,
            duration_minutes: duration,
            repeat_until: form.repeatUntil,
          }
        : {
            starts_at: localToUtcIso(form.date, form.start, zone),
            ends_at: localToUtcIso(endDate, form.end, zone),
            weekly_days: null,
            local_start_time: null,
            duration_minutes: null,
            repeat_until: null,
          };
    return {
      ...timing,
      title: form.title.trim(),
      description: text(form.description),
      kind: form.kind,
      format: form.format,
      venue_id: form.format === "in_person" ? venueId : null,
      online_url: form.format === "online" ? form.onlineUrl.trim() : null,
      time_zone: zone,
      capacity,
      booking_mode: form.bookingMode,
      booking_url: form.bookingMode === "external_link" ? form.bookingUrl.trim() : null,
      interests: form.interests,
      is_private_home: isPrivateHome,
      area: isPrivateHome ? form.area.trim() : null,
    };
  };

  const run = async (task: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await task();
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  const save = () =>
    run(async () => {
      let venueId = venue?.id ?? null;
      if (form.format === "in_person" && !venueId) {
        const created = await createVenue(supabase, profile.id, {
          name: form.newVenueName.trim(),
          address: form.newVenueAddress.trim() || null,
          time_zone: zone,
          is_private: form.newVenuePrivate,
        });
        // Keep the new place selected, so retrying after an error doesn't add it twice.
        setVenues((vs) => [...vs, created]);
        set("venueId", created.id);
        venueId = created.id;
      }
      if (forDate) await updateOccurrence(supabase, occurrence.id, toDateFields(toFields(venueId)));
      else if (event) await updateEvent(supabase, event.id, toFields(venueId));
      else await createEvent(supabase, profile.id, toFields(venueId));
    });

  // A date stores only what differs from its event; null means "same as the event".
  const toDateFields = (f: EventFields): OccurrenceFields => {
    const e = occurrence!.event;
    const own = <T,>(value: T, eventValue: T) => (value === eventValue ? null : value);
    return {
      starts_at: f.starts_at!,
      ends_at: f.ends_at!,
      title: own(f.title, e.title),
      description: own(f.description ?? null, e.description),
      format: own(f.format ?? "in_person", e.format),
      venue_id: f.venue_id ? own(f.venue_id, e.venue_id) : null,
      online_url: f.online_url ? own(f.online_url, e.online_url) : null,
      time_zone: own(f.time_zone, e.time_zone),
      capacity: own(f.capacity ?? null, e.capacity),
      booking_mode: own(f.booking_mode ?? "rsvp", e.booking_mode),
      booking_url: f.booking_url ? own(f.booking_url, e.booking_url) : null,
      is_private_home: own(f.is_private_home ?? false, e.is_private_home),
      area: f.area ? own(f.area, e.area) : null,
    };
  };

  const resetDate = async () => {
    if (!occurrence) return;
    if (!(await confirm("Undo changes to this date?", "It goes back to the event's usual time and details.", "Undo changes"))) return;
    await run(() => resetOccurrence(supabase, occurrence.id));
  };

  const togglePrivateHome = async (on: boolean) => {
    if (
      on &&
      !(await confirm(
        "Is this a private home?",
        "Your exact address will only be shown to you. Everyone else sees the area you enter, such as a neighborhood or city. Once bookings arrive, people who book will see the address.",
        "It's a home",
      ))
    ) {
      return;
    }
    set("newVenuePrivate", on);
  };

  const cancelDate = async () => {
    if (!occurrence) return;
    const restoring = occurrence.status === "cancelled";
    if (!restoring && !(await confirm("Cancel this date?", "Only this date is cancelled. The rest of the series stays.", "Cancel date"))) return;
    await run(() => setOccurrenceStatus(supabase, occurrence.id, restoring ? "scheduled" : "cancelled"));
  };

  const cancelEvent = async () => {
    if (!event) return;
    const weekly = Boolean(event.weekly_days);
    const ok = await confirm(
      weekly ? "Cancel every date?" : "Cancel this event?",
      weekly ? "All upcoming dates of this event will be cancelled." : "The event will show as cancelled.",
      weekly ? "Cancel all dates" : "Cancel event",
    );
    if (ok) await run(() => setEventStatus(supabase, event.id, "cancelled"));
  };

  const zoneChoices = Array.from(new Set([deviceTimeZone(), zone, ...COMMON_TIME_ZONES]));
  const now = new Date().toISOString();
  const occurrenceDate = occurrence ? formatDate(utcToLocal(occurrence.starts_at, zone).date) : null;

  return (
    <ScrollView contentContainerStyle={formStyles.container} keyboardShouldPersistTaps="handled">
      {cancelledEvent ? <Text style={styles.banner}>This event is cancelled.</Text> : null}
      {scopePicker}
      {forDate && occurrence.is_modified ? (
        <Text style={styles.note}>This date has its own changes. They stay when you edit every date; anything else still follows the series.</Text>
      ) : null}

      <Field label="Title" count={form.title.length} max={LIMITS.title}>
        <TextInput style={formStyles.input} value={form.title} onChangeText={(v) => set("title", v)} placeholder="e.g. Sunrise Vinyasa" />
      </Field>

      {!forDate ? (
      <Field label="When">
        <Chips
          options={[
            { value: "once", label: "One time" },
            { value: "weekly", label: "Weekly" },
          ]}
          selected={form.when}
          onToggle={(v) => set("when", v)}
          accentColor={accent}
        />
      </Field>
      ) : null}

      {form.when === "once" ? (
        <Field label="Date">
          <DateTimeField mode="date" value={form.date} minimumDate={today} onChange={(v) => set("date", v)} />
        </Field>
      ) : (
        <Field label="Every">
          <Chips
            options={WEEKDAYS_SHORT.map((label, value) => ({ value, label }))}
            selected={form.days}
            onToggle={(d) => set("days", form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d])}
            accentColor={accent}
          />
        </Field>
      )}

      <View style={styles.timeRow}>
        <View style={styles.timeCell}>
          <Field label="Starts">
            <DateTimeField
              mode="time"
              value={form.start}
              onChange={(v) => {
                // Keep the same length when the start moves.
                const length = minutesBetween(form.start, form.end);
                setForm((f) => ({ ...f, start: v, end: addMinutesToClock(v, length) }));
              }}
            />
          </Field>
        </View>
        <View style={styles.timeCell}>
          <Field label="Ends">
            <DateTimeField mode="time" value={form.end} onChange={(v) => set("end", v)} />
          </Field>
        </View>
      </View>

      {form.when === "weekly" ? (
        <View style={styles.switchRow}>
          <Text style={[formStyles.label, { flex: 1 }]}>Ends on a date</Text>
          <Switch
            value={form.repeatUntil !== null}
            onValueChange={(on) => set("repeatUntil", on ? addDaysToDate(today, 84) : null)}
          />
        </View>
      ) : null}
      {form.when === "weekly" && form.repeatUntil ? (
        <Field label="Last date">
          <DateTimeField mode="date" value={form.repeatUntil} minimumDate={today} onChange={(v) => set("repeatUntil", v)} />
        </Field>
      ) : null}

      <Field label="Where">
        <Chips
          options={[
            { value: "in_person", label: "In person" },
            { value: "online", label: "Online" },
          ]}
          selected={form.format}
          onToggle={(v) => set("format", v)}
          accentColor={accent}
        />
      </Field>

      {form.format === "in_person" ? (
        <>
          <Field label="Place">
            <Chips
              options={[...venues.map((v) => ({ value: v.id, label: v.name })), { value: "", label: "+ New place" }]}
              selected={form.venueId ?? ""}
              onToggle={(v) => set("venueId", v || null)}
              accentColor={accent}
            />
          </Field>
          {!venue ? (
            <>
              <Field label="Place name">
                <TextInput
                  style={formStyles.input}
                  value={form.newVenueName}
                  onChangeText={(v) => set("newVenueName", v)}
                  placeholder="e.g. Ra Yoga Mission Viejo"
                />
              </Field>
              <Field label="Address" hint="Optional. A map comes in a later update.">
                <TextInput style={formStyles.input} value={form.newVenueAddress} onChangeText={(v) => set("newVenueAddress", v)} />
              </Field>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={formStyles.label}>This is a private home</Text>
                  <Text style={formStyles.hint}>Keeps the address hidden.</Text>
                </View>
                <Switch value={form.newVenuePrivate} onValueChange={togglePrivateHome} />
              </View>
            </>
          ) : null}
          {isPrivateHome ? (
            <Field label="Area shown instead of the address" hint="A neighborhood or city." count={form.area.length} max={LIMITS.area}>
              <TextInput style={formStyles.input} value={form.area} onChangeText={(v) => set("area", v)} placeholder="e.g. Laguna Hills" />
            </Field>
          ) : null}
        </>
      ) : (
        <Field label="Link" hint="Zoom, Google Meet, or similar. Visible on your schedule.">
          <TextInput
            style={formStyles.input}
            value={form.onlineUrl}
            onChangeText={(v) => set("onlineUrl", v)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://"
          />
        </Field>
      )}

      <View style={styles.zoneRow}>
        <Text style={formStyles.hint}>
          Times are in {zoneLabel(now, zone)} ({zone}){venue ? `, from ${venue.name}` : ""}.
        </Text>
        {!venue ? (
          <Pressable onPress={() => setPickZone((p) => !p)} hitSlop={8}>
            <Text style={[styles.link, { color: accent }]}>{pickZone ? "Done" : "Change"}</Text>
          </Pressable>
        ) : null}
      </View>
      {pickZone && !venue ? (
        <View style={styles.zoneChoices}>
          <Chips
            options={zoneChoices.map((z) => ({ value: z, label: z.replace(/_/g, " ") }))}
            selected={zone}
            onToggle={(z) => set("timeZone", z)}
            accentColor={accent}
          />
        </View>
      ) : null}

      <Pressable onPress={() => setShowMore((s) => !s)} style={styles.moreToggle}>
        <Text style={[styles.link, { color: accent }]}>{showMore ? "Fewer options" : "More options"}</Text>
      </Pressable>

      {showMore ? (
        <>
          <Field label="Description" count={form.description.length} max={LIMITS.description}>
            <TextInput
              style={[formStyles.input, formStyles.multiline]}
              value={form.description}
              onChangeText={(v) => set("description", v)}
              multiline
            />
          </Field>
          {!forDate ? (
          <Field label="Kind">
            <Chips
              options={[
                { value: "class", label: "Class" },
                { value: "workshop", label: "Workshop" },
                { value: "meetup", label: "Meetup" },
              ]}
              selected={form.kind}
              onToggle={(v) => set("kind", v)}
              accentColor={accent}
            />
          </Field>
          ) : null}
          <Field
            label="Capacity"
            hint={`Optional. On the free plan, a one-time event for more than ${EVENT_CAPS.largerOver} people (or no limit) counts as your larger event for the month.`}
          >
            <TextInput
              style={formStyles.input}
              value={form.capacity}
              onChangeText={(v) => set("capacity", v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder="No limit"
            />
          </Field>
          <Field label="Booking">
            <Chips
              options={[
                { value: "rsvp", label: "RSVP on SkedgeLife (soon)" },
                { value: "external_link", label: "Link to a booking page" },
              ]}
              selected={form.bookingMode}
              onToggle={(v) => {
                set("bookingMode", v);
                if (v === "external_link" && !form.bookingUrl && venue?.booking_url) set("bookingUrl", venue.booking_url);
              }}
              accentColor={accent}
            />
          </Field>
          {form.bookingMode === "external_link" ? (
            <Field label="Booking link">
              <TextInput
                style={formStyles.input}
                value={form.bookingUrl}
                onChangeText={(v) => set("bookingUrl", v)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="https://"
              />
            </Field>
          ) : null}
          {!forDate ? (
            <Field label="Interests" hint="Helps people find it once search arrives.">
              <TagEditor tags={form.interests} onChange={(v) => set("interests", v)} placeholder="e.g. Yin yoga" accentColor={accent} />
            </Field>
          ) : null}
        </>
      ) : null}

      {error ? <Text style={formStyles.error}>{error}</Text> : null}
      {problem && (changed || event) && !cancelledEvent ? <Text style={styles.problem}>{problem}</Text> : null}
      <Pressable style={[formStyles.primaryButton, !canSave && formStyles.disabled]} disabled={!canSave} onPress={save}>
        <Text style={formStyles.primaryText}>{saving ? "Saving…" : forDate ? "Save this date" : event ? "Save every date" : "Add event"}</Text>
      </Pressable>

      {forDate && !cancelledEvent ? (
        <>
          {occurrence.is_modified ? (
            <Pressable style={formStyles.secondaryButton} disabled={saving} onPress={resetDate}>
              <Text style={styles.restoreText}>Undo changes to this date</Text>
            </Pressable>
          ) : null}
          <Pressable style={formStyles.secondaryButton} disabled={saving} onPress={cancelDate}>
            <Text style={occurrence.status === "cancelled" ? styles.restoreText : formStyles.dangerText}>
              {occurrence.status === "cancelled" ? `Restore ${occurrenceDate}` : `Cancel ${occurrenceDate} only`}
            </Text>
          </Pressable>
        </>
      ) : null}
      {event && !forDate && !cancelledEvent ? (
        <Pressable style={formStyles.secondaryButton} disabled={saving} onPress={cancelEvent}>
          <Text style={formStyles.dangerText}>{event.weekly_days ? "Cancel all dates" : "Cancel event"}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: "#fbeaea", color: "#b3261e", padding: 12, borderRadius: 8, marginBottom: 16, fontWeight: "600" },
  timeRow: { flexDirection: "row", gap: 16 },
  timeCell: { flex: 1 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  zoneRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginTop: -6, marginBottom: 12 },
  zoneChoices: { marginBottom: 18 },
  link: { fontSize: 14, fontWeight: "600" },
  moreToggle: { marginVertical: 12 },
  problem: { color: "#777", fontSize: 13, marginTop: 16 },
  note: { backgroundColor: "#f4f4f4", color: "#555", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 },
  restoreText: { color: "#2f2f2f", fontSize: 16, fontWeight: "600" },
});
