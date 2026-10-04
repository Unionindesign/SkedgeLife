# Scheduling, events, and bookings

**Status:** Direction agreed 2026-10-03 (see `docs/DECISIONS.md`). Details below the decisions are still a proposal until Phase 1 is planned.

## Why

SkedgeLife is a scheduling app first. Today the schedule is a list of studios with free-text times ("5:30pm Hot Ra") that link out to someone else's booking page. That's fine for showing Michelle's week, but nobody can search it, book it, or trust it across time zones.

The goal is for anyone to post things happening at real times and places, such as a teacher's classes, a group hike, or a hobby meetup. People can then find what's near them, at times that suit them, matching their interests, and book through SkedgeLife. When people pay through SkedgeLife, we take a fee.

## What each plan gets

| | Free (like a simple Google Calendar) | Paid (like Calendly, on top of free) |
|---|---|---|
| Events | Up to **3 weekly recurring events** and **1 larger group event a month**, in person or online | No cap |
| Discovery | Public events appear in search | Same |
| Booking | Free RSVPs, a capacity limit, or a link out to an external booking page | Paid bookings through SkedgeLife (Stripe), refunds and cancellation policy |
| Appointments | — | Weekly availability plus bookable appointment types (for example a 60-minute private, online or in person) that others book into open slots |
| Calendar | Add to your phone's calendar (.ics) | Two-way sync with Google or Apple calendars (later) |

The line between the plans: **anything more than part-time is paid.** Someone running a few weekly classes or the occasional group hike stays free. Someone running a full client book or many weekly group events pays.

This fits the "minutes, not months" rule. Creating an event is a title, a time, and a place. Everything else is optional.

## Proposed data model

All times follow [`docs/rules/time.md`](../rules/time.md).

- **`venues`**: name, address, location (PostGIS `geography(point)`), IANA `time_zone`, logo, and an optional booking link. Replaces the venue columns on `schedule_entries`. Shared between hosts, so many teachers can teach at one studio.
- **`events`**: the template, with an optional "this is a private home" flag. When it's set, the app shows a confirmation and the exact address stays hidden until someone has booked; everyone else sees only the neighborhood.
  - Who and what: host `profile_id`, title, description, interests (tags, same style as profile interests), kind (class, meetup, workshop).
  - Where: format (in person, online, or hybrid), `venue_id` for in person, and an online link shown only to people who booked.
  - When: `time_zone`; for a one-off event, `starts_at` and `ends_at`; for a weekly event, local start time, duration, weekdays, and an optional end date.
  - Booking: capacity; booking mode (`rsvp`, `external_link`, or `paid`); price.
  - Visibility (public, followers, or unlisted) and status (scheduled or cancelled).
- **`event_occurrences`**: one row per actual time, with `starts_at` and `ends_at` in UTC and a status, so a single date can be cancelled. For weekly events, a Postgres function generates them for a rolling window (for example 12 weeks). Postgres's own time-zone handling keeps "9am Mondays" at 9am across daylight-saving changes, and a nightly scheduled job (`pg_cron`) extends the window. Search and bookings work on occurrences, never on the recurrence pattern.
- **`bookings`**: occurrence, attendee profile, status (confirmed, cancelled, or later waitlisted), and a payment reference. Row-level security lets only the attendee and the host see a booking.
- **Paid plan (later):**
  - `availability_rules`: weekly hours in local time plus a zone, and blocked-out dates.
  - `appointment_types`: title, duration, buffer time, price, and format. These replace `private_session_types`.
  - Booking an open slot creates a private occurrence plus its booking.

**Recurrence:** start with "weekly on these days" plus one-off events, which covers classes and meetups. Full calendar recurrence rules (RFC 5545 RRULE) can come later if people need them.

**Search:** one database function, `search_events(location, radius, from, to, interests)`. It uses PostGIS distance on venue locations, an indexed time range on occurrences, and interest overlap. The searcher's location is used for the query and never stored. Online events match on time and interests only.

**What happens to today's data:**
- `schedule_entries` become venues, and `schedule_times` become weekly events with real times.
- Michelle's studio classes keep linking out (`external_link`) until studios book through us.
- The Schedule tab reads occurrences and shows real local times.

## Revenue

Paid bookings use Stripe Connect. The host gets paid directly, and SkedgeLife keeps a platform fee per booking. Free RSVPs cost nothing. This builds on the Stripe work in #20 (with your brother) and the rates question in #33.

## Phases (proposed milestones)

1. **Real times.** Rules doc; schema for venues, events, and occurrences with weekly expansion; migrate the current schedule data and seed; Schedule tab shows real local times; create and edit events in the app; enforce the free-plan weekly cap. Replaces #13.
2. **Discovery.** Move phone preview to a development build; Mapbox map and place picker with geocoding; `search_events`; a Discover tab filtered by near me, date and time, and interests; interest settings and recommendations, with on/off toggles.
3. **RSVP and attending.** Bookings with capacity; "My schedule" for attendees; add to phone calendar (.ics); the host's attendee list; cancellation notices (ties to #47).
4. **Paid bookings and appointments.** Stripe Connect onboarding; paid bookings with a platform fee; availability and appointment types with a public booking page.
5. **Calendar sync** (later).

## Maps

Our needs are small: a set of points (venues and events), tap for details, and basic clustering if the app gets busy. Any provider below handles that. Two things matter more than the logo:

- **Expo Go can't run Mapbox or MapLibre.** Both are native modules, so the phone preview moves from Expo Go to a **development build**: our own copy of Expo Go, built once with EAS (free tier) and installed on the phone. Day-to-day reloading works the same afterward. `react-native-maps` (Apple Maps on iOS, Google Maps on Android) is the one option that runs in Expo Go.
- **Storing geocoded coordinates has licence terms.** We save each venue's location, and Mapbox only allows that with its *permanent* geocoding, which has no free tier (about $5 per 1,000 lookups). We geocode once per venue, so 1,000 venues cost about $5.

| Option | Map display | Cost at our size | Notes |
|---|---|---|---|
| **Mapbox** (`@rnmapbox/maps`, Mapbox GL JS on web) | Mapbox tiles and styles | Free up to 25,000 monthly mobile users and 50,000 web map loads | Best styling tools and docs. Needs a development build and a secret download token. Permanent geocoding is paid as above. |
| **MapLibre + OpenFreeMap** (`@maplibre/maplibre-react-native`, MapLibre GL JS on web) | Free OpenStreetMap vector tiles, no key | $0 | Open-source fork of Mapbox GL; same style format, so moving between it and Mapbox is easy. OpenFreeMap is donation-funded with no uptime promise. Pair with a geocoder (Mapbox permanent, or another provider whose terms allow storing results). |
| **MapLibre + MapTiler or Stadia Maps** | Hosted tiles with an SLA | Free plans are **non-commercial** only; paid plans start around $25–50 a month | Worth it later if OpenFreeMap proves unreliable. Both also sell geocoding. |
| **MapLibre + self-hosted Protomaps** (one `.pmtiles` file on object storage) | Our own tiles | Pennies of storage and bandwidth | Most control and cheapest at scale, but we own updates. Overkill for now. |
| **`react-native-maps`** | Apple Maps (iOS) / Google Maps (Android) | Free | Works in Expo Go today. Doesn't work on the web, looks different on each platform, and needs `supercluster` for clustering. |

**Recommendation:** Mapbox, as decided. It's free at our size, you know it well, and its permanent geocoding cost is trivial at one lookup per venue. Write the map code against the shared Mapbox/MapLibre style format so we can switch to MapLibre + OpenFreeMap if pricing ever changes. Revisit if the monthly bill passes about $50.

## Open questions

1. **What counts as a "larger group event"?** *Proposal:* any one-off event with capacity over 20 (or no cap). Smaller one-offs, like a single hike for 8 people, count toward the 3 weekly slots for that week.
2. **The platform fee:** what percentage, and does the host or the attendee pay it? (With your brother, #20.)
3. **Interests and recommendations:** discovery needs more UI. Users set their interests, get recommended classes and events, and can turn recommendations and notifications on or off. This is search and suggestions people opt into, not a feed. It's scoped into Phase 2; the details come when we plan that phase.
