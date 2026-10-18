import { TZDate } from "@date-fns/tz";

// Time helpers shared by the app and (later) the website. See docs/rules/time.md:
// conversions go through @date-fns/tz, display through Intl.DateTimeFormat,
// and nothing here does offset arithmetic by hand.

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const pad = (n: number) => String(n).padStart(2, "0");

// A wall-clock date ("2026-11-02") and time ("09:00") in `timeZone`, as an
// ISO 8601 UTC string with a Z.
export function localToUtcIso(date: string, time: string, timeZone: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(new TZDate(y, m - 1, d, hh, mm, timeZone).getTime()).toISOString();
}

// The wall-clock date and time of a moment in `timeZone`, for editing.
export function utcToLocal(iso: string, timeZone: string): { date: string; time: string } {
  const t = new TZDate(new Date(iso).getTime(), timeZone);
  return {
    date: `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`,
    time: `${pad(t.getHours())}:${pad(t.getMinutes())}`,
  };
}

// Today's date in `timeZone`, as "2026-10-16".
export function todayIn(timeZone: string): string {
  return utcToLocal(new Date().toISOString(), timeZone).date;
}

// "9:00 AM" for a moment in a zone.
export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).format(new Date(iso));
}

// "9:00 AM" for a wall-clock time such as "09:00" or "09:00:00".
export function formatClock(time: string): string {
  const [hh, mm] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
    new Date(Date.UTC(2000, 0, 1, hh, mm)),
  );
}

// "Fri, Oct 17" for a wall-clock date such as "2026-10-17".
export function formatDate(date: string, style: "short" | "long" = "short"): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: style,
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

// The zone's short name at that moment, e.g. "PT" (or "PDT" where the
// generic name isn't supported).
export function zoneLabel(iso: string, timeZone: string): string {
  for (const timeZoneName of ["shortGeneric", "short"] as const) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName }).formatToParts(new Date(iso));
      const name = parts.find((p) => p.type === "timeZoneName")?.value;
      if (name) return name;
    } catch {
      // Older Intl implementations reject shortGeneric; fall through to short.
    }
  }
  return timeZone;
}

// Whether two zones show the same wall-clock time at a moment, in which case
// naming the zone adds nothing.
export function sameWallClock(iso: string, a: string, b: string): boolean {
  if (a === b) return true;
  const x = utcToLocal(iso, a);
  const y = utcToLocal(iso, b);
  return x.date === y.date && x.time === y.time;
}

// Minutes from a start to an end wall-clock time; an end at or before the
// start means the next day.
export function minutesBetween(start: string, end: string): number {
  const toMin = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    return hh * 60 + mm;
  };
  const diff = toMin(end) - toMin(start);
  return diff > 0 ? diff : diff + 24 * 60;
}

// The wall-clock time `minutes` after `start`, wrapping past midnight.
export function addMinutesToClock(start: string, minutes: number): string {
  const [hh, mm] = start.split(":").map(Number);
  const total = (((hh * 60 + mm + minutes) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

// The wall-clock date `days` after `date` (calendar arithmetic, no zones involved).
export function addDaysToDate(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

// 0 = Sunday, for a wall-clock date.
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// The Sunday that starts the week containing `date`.
export function startOfWeek(date: string): string {
  return addDaysToDate(date, -weekdayOf(date));
}

// "2026-10-01" for any date in October 2026.
export function startOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

// The first of the month `months` after the month containing `date`.
export function addMonths(date: string, months: number): string {
  const [y, m] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-01`;
}

// "Oct 18 – 24", or "Oct 25 – Nov 1" across months, for a week starting on `start`.
export function formatWeekRange(start: string): string {
  const end = addDaysToDate(start, 6);
  const monthDay = (date: string) => {
    const [y, m, d] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(y, m - 1, d)),
    );
  };
  return start.slice(0, 7) === end.slice(0, 7)
    ? `${monthDay(start)} – ${Number(end.slice(8))}`
    : `${monthDay(start)} – ${monthDay(end)}`;
}

// "October 2026".
export function formatMonth(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

// Days between two wall-clock dates (b - a).
export function daysBetween(a: string, b: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

// Zones offered when choosing a place's or an online event's zone, until
// Phase 2 fills them in from the map. The device's zone is always added.
export const COMMON_TIME_ZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Phoenix",
  "America/Chicago",
  "America/New_York",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Costa_Rica",
  "America/Mexico_City",
  "Europe/London",
  "Europe/Paris",
  "Asia/Bangkok",
  "Australia/Sydney",
] as const;
