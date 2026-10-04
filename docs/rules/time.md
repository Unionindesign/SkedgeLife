# Rule: Time

SkedgeLife is a scheduling app, so every time must mean the same moment for everyone, whatever zone they're in and whatever the date of the daylight-saving change.

## The rule

1. **Store moments as `timestamptz`, which Postgres keeps in UTC.** Never use `timestamp` (without time zone). The database session time zone stays `UTC`.
2. **Send ISO 8601 with a `Z`** between the database, the app, and the web: `2026-10-03T16:30:00Z`. Never send epoch numbers, local strings like `"5:30pm"`, or times without an offset.
3. **Every event records its IANA time zone**, such as `America/Los_Angeles`. Never store an offset (`-07:00`) or an abbreviation (`PST`) as the zone, because offsets change with daylight saving.
4. **Recurring events store their pattern in local time with that zone** (for example "Mondays at 09:00, `America/Los_Angeles`"). Each occurrence is then expanded to UTC `timestamptz`. This is the one place local time is stored. If "every Monday at 9am" were stored as a fixed UTC time, the class would move by an hour twice a year.
5. **Dates without a time-of-day use `date`**, such as all-day events or "valid until". Don't use a timestamp at midnight, which turns into the previous day in zones west of UTC.
6. **Events store `starts_at` and `ends_at`**, with a check that `ends_at > starts_at`. Don't store a start plus a duration in minutes.
7. **Convert to local time only when displaying it:**
   - **In-person events** show in the event's own zone, because that's where the attendee will be. Add the zone name if it differs from the viewer's device zone (for example "9:00 AM PT").
   - **Online events** show in the viewer's device zone.
   - Hosts editing their own events see and enter the event's zone.
8. **The server decides "now".** Booking cutoffs, "upcoming" filters, and anything that must be fair use the database's `now()`, not the phone's clock.
9. **No hand-written offset math.** Use `Intl.DateTimeFormat` for display and a time-zone library for conversions. The first feature that needs one picks it and records the choice here. Once tests exist (#88), cover the daylight-saving changes (US: second Sunday of March, first Sunday of November).

## Where the zones come from

- **The device:** `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- **A venue:** stored with the venue, and filled in from its location when the venue is created.
- **An online event:** the host's zone at creation, which the host can change.

## Known gaps

- `schedule_times` stores `day_of_week` plus a free-text `label` ("5:30pm Hot Ra") with no real time or zone. The scheduling plan (`docs/plans/2026-10-03-scheduling-events-and-bookings.md`) replaces it.
