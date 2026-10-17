-- Scheduling 1: events at real times and places (#90, #94, #95).
-- Plan: docs/plans/2026-10-16-scheduling-1-real-times.md. Times follow
-- docs/rules/time.md: moments are timestamptz, every event has an IANA zone,
-- and weekly patterns are stored in local time and expanded to UTC.

create extension if not exists postgis with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

-- Time zones -----------------------------------------------------------------

-- A real IANA zone name such as 'America/Los_Angeles' (or 'UTC'). Rejects
-- abbreviations ('PST') and offsets ('-07:00'), which change with daylight saving.
create function public.is_time_zone(tz text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  if tz is null or not (tz = 'UTC' or tz ~ '^[A-Za-z]+(/[A-Za-z0-9_+-]+)+$') then
    return false;
  end if;
  perform timestamptz '2000-01-01 00:00:00+00' at time zone tz;
  return true;
exception when others then
  return false;
end;
$$;

-- Venues ---------------------------------------------------------------------

-- Places events happen. Shared between hosts (many teachers at one studio),
-- except private venues such as someone's home, which only the creator can see.
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  address text check (char_length(address) <= 300),
  location extensions.geography(point, 4326), -- filled in from the map in Phase 2
  time_zone text not null check (public.is_time_zone(time_zone)),
  logo_url text,
  booking_url text check (char_length(booking_url) <= 500),
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.venues (created_by);

create trigger venues_set_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

alter table public.venues enable row level security;

create policy "Public venues, and your own private ones"
  on public.venues for select
  to anon, authenticated
  using (not is_private or created_by = (select auth.uid()));

create policy "Creator insert"
  on public.venues for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "Creator update"
  on public.venues for update
  to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

create policy "Creator delete"
  on public.venues for delete
  to authenticated
  using (created_by = (select auth.uid()));

-- Events ---------------------------------------------------------------------

-- An event is either one-off (starts_at/ends_at) or weekly (days, a local
-- start time, and a duration, since a local end time can cross midnight).
-- Either way, the actual dates live in event_occurrences.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 2000),
  interests text[] not null default '{}',
  kind text not null default 'class' check (kind in ('class', 'meetup', 'workshop')),
  format text not null default 'in_person' check (format in ('in_person', 'online', 'hybrid')),
  venue_id uuid references public.venues (id) on delete restrict,
  -- Public until bookings exist (Phase 3), then shown only to people who booked.
  online_url text check (char_length(online_url) <= 500),
  time_zone text not null check (public.is_time_zone(time_zone)),
  starts_at timestamptz,
  ends_at timestamptz,
  weekly_days smallint[], -- 0 = Sunday
  local_start_time time,
  duration_minutes integer check (duration_minutes between 5 and 1440),
  repeat_until date,
  capacity integer check (capacity > 0),
  booking_mode text not null default 'rsvp' check (booking_mode in ('rsvp', 'external_link', 'paid')),
  booking_url text check (char_length(booking_url) <= 500),
  visibility text not null default 'public' check (visibility in ('public', 'followers', 'unlisted')),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  -- A private home: the venue is private, and everyone else sees `area` instead.
  is_private_home boolean not null default false,
  area text check (char_length(area) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_one_off_or_weekly check (
    (starts_at is not null and ends_at is not null
      and weekly_days is null and local_start_time is null and duration_minutes is null and repeat_until is null)
    or (starts_at is null and ends_at is null
      and coalesce(cardinality(weekly_days), 0) > 0 and local_start_time is not null and duration_minutes is not null)
  ),
  constraint events_ends_after_start check (ends_at > starts_at),
  constraint events_weekly_days_valid check (weekly_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  constraint events_place check (
    (format = 'online' or venue_id is not null) and (format = 'in_person' or online_url is not null)
  ),
  constraint events_booking_link check (booking_mode <> 'external_link' or booking_url is not null),
  constraint events_private_home_in_person check (not is_private_home or format <> 'online')
);

create index on public.events (profile_id);
create index on public.events (venue_id);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;

-- Follower-only events wait for the follow graph (#46); until then only the host sees them.
create policy "Public read"
  on public.events for select
  to anon, authenticated
  using (visibility <> 'followers' or profile_id = (select auth.uid()));

-- The venue subquery runs under venues' own policies, so a host can't attach
-- someone else's private venue.
create policy "Owner insert"
  on public.events for insert
  to authenticated
  with check (
    profile_id = (select auth.uid())
    and (venue_id is null or exists (select 1 from public.venues v where v.id = venue_id))
  );

create policy "Owner update"
  on public.events for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (
    profile_id = (select auth.uid())
    and (venue_id is null or exists (select 1 from public.venues v where v.id = venue_id))
  );

create policy "Owner delete"
  on public.events for delete
  to authenticated
  using (profile_id = (select auth.uid()));

-- Occurrences ----------------------------------------------------------------

-- One row per actual date, generated by sync_event_occurrences(). A host can
-- cancel a date, or change it on its own: move it, or give it its own title,
-- place, link, capacity, or booking. Detail columns are null when the date is
-- the same as its event (packages/data merges them).
create table public.event_occurrences (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  -- The slot in the event's schedule this date fills; it stays put when the
  -- host moves the date, so the schedule doesn't refill that slot.
  original_starts_at timestamptz not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  -- Set automatically when the host changes this date; schedule edits then leave it alone.
  is_modified boolean not null default false,
  title text check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 2000),
  format text check (format in ('in_person', 'online', 'hybrid')),
  venue_id uuid references public.venues (id) on delete restrict,
  online_url text check (char_length(online_url) <= 500),
  time_zone text check (time_zone is null or public.is_time_zone(time_zone)),
  capacity integer check (capacity > 0),
  booking_mode text check (booking_mode in ('rsvp', 'external_link', 'paid')),
  booking_url text check (char_length(booking_url) <= 500),
  is_private_home boolean,
  area text check (char_length(area) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_occurrences_ends_after_start check (ends_at > starts_at),
  unique (event_id, original_starts_at)
);

create index on public.event_occurrences (starts_at);
create index on public.event_occurrences (venue_id);

create trigger event_occurrences_set_updated_at
  before update on public.event_occurrences
  for each row execute function public.set_updated_at();

alter table public.event_occurrences enable row level security;

-- Visible when the event is (the subquery runs under events' policies).
create policy "Read with the event"
  on public.event_occurrences for select
  to anon, authenticated
  using (exists (select 1 from public.events e where e.id = event_id));

-- As with events, a date can't be moved to someone else's private venue.
create policy "Host updates dates"
  on public.event_occurrences for update
  to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.profile_id = (select auth.uid())))
  with check (
    exists (select 1 from public.events e where e.id = event_id and e.profile_id = (select auth.uid()))
    and (venue_id is null or exists (select 1 from public.venues v where v.id = venue_id))
  );

revoke all on public.event_occurrences from anon, authenticated;
grant select on public.event_occurrences to anon, authenticated;
grant update (
  status, starts_at, ends_at, title, description, format, venue_id, online_url, time_zone,
  capacity, booking_mode, booking_url, is_private_home, area
) on public.event_occurrences to authenticated;

-- Marks host changes as modified, and checks that the date still makes sense
-- once merged with its event (the same rules as events' constraints).
-- sync_event_occurrences() sets skedgelife.syncing so its own updates pass through.
create function public.check_occurrence_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  e public.events;
  merged_format text;
begin
  if current_setting('skedgelife.syncing', true) = 'on' then
    return new;
  end if;

  if (new.starts_at, new.ends_at, new.title, new.description, new.format, new.venue_id, new.online_url,
      new.time_zone, new.capacity, new.booking_mode, new.booking_url, new.is_private_home, new.area)
    is distinct from
     (old.starts_at, old.ends_at, old.title, old.description, old.format, old.venue_id, old.online_url,
      old.time_zone, old.capacity, old.booking_mode, old.booking_url, old.is_private_home, old.area) then
    new.is_modified := true;
  end if;

  select * into e from public.events where id = new.event_id;
  merged_format := coalesce(new.format, e.format);
  if (merged_format <> 'online' and coalesce(new.venue_id, e.venue_id) is null)
    or (merged_format <> 'in_person' and coalesce(new.online_url, e.online_url) is null) then
    raise exception 'This date needs a place, or a link for online events.' using errcode = '23514';
  end if;
  if coalesce(new.booking_mode, e.booking_mode) = 'external_link' and coalesce(new.booking_url, e.booking_url) is null then
    raise exception 'This date needs a booking link.' using errcode = '23514';
  end if;
  if coalesce(new.is_private_home, e.is_private_home) and merged_format = 'online' then
    raise exception 'An online date can''t be at a private home.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger check_occurrence_change
  before update on public.event_occurrences
  for each row execute function public.check_occurrence_change();

-- Generating occurrences -----------------------------------------------------

-- The dates an event should have from now on: its one-off time, or its weekly
-- days up to `horizon` ahead. `local date + local time AT TIME ZONE zone` turns
-- wall-clock time into UTC using that date's offset, so 09:00 stays 09:00
-- across daylight-saving changes.
create function public.event_desired_occurrences(e public.events, horizon interval)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
set search_path = ''
as $$
  select e.starts_at, e.ends_at
  where e.weekly_days is null and e.ends_at > now()
  union all
  select s.starts_at, s.starts_at + make_interval(mins => e.duration_minutes)
  from (
    select (d::date + e.local_start_time) at time zone e.time_zone as starts_at
    from generate_series(
      (now() at time zone e.time_zone)::date::timestamp,
      least(e.repeat_until, ((now() + horizon) at time zone e.time_zone)::date)::timestamp,
      interval '1 day'
    ) as d
    where extract(dow from d)::smallint = any (e.weekly_days)
  ) s
  where e.weekly_days is not null
    and s.starts_at + make_interval(mins => e.duration_minutes) > now();
$$;

-- Brings an event's future dates in line with its schedule. Past dates are
-- never touched. Dates are matched to schedule slots by the local day of the
-- slot they fill, so they keep their id (and later their bookings):
-- - an unchanged date follows a time change on the same day, keeping its
--   status, so a cancelled date stays cancelled; it goes when its day leaves
--   the pattern;
-- - a date the host changed on its own is left alone, and its slot isn't refilled.
create function public.sync_event_occurrences(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.events;
  horizon constant interval := interval '12 weeks';
begin
  select * into e from public.events where id = p_event_id;
  if not found then
    return;
  end if;
  perform set_config('skedgelife.syncing', 'on', true);

  if e.status = 'cancelled' then
    update public.event_occurrences set status = 'cancelled'
    where event_id = e.id and ends_at > now() and status = 'scheduled';
    perform set_config('skedgelife.syncing', 'off', true);
    return;
  end if;

  delete from public.event_occurrences o
  where o.event_id = e.id and not o.is_modified and o.ends_at > now()
    and not exists (
      select 1 from public.event_desired_occurrences(e, horizon) d
      where (d.starts_at at time zone e.time_zone)::date = (o.original_starts_at at time zone e.time_zone)::date
    );

  update public.event_occurrences o
  set original_starts_at = d.starts_at, starts_at = d.starts_at, ends_at = d.ends_at
  from public.event_desired_occurrences(e, horizon) d
  where o.event_id = e.id and not o.is_modified and o.ends_at > now()
    and (d.starts_at at time zone e.time_zone)::date = (o.original_starts_at at time zone e.time_zone)::date
    and (o.original_starts_at, o.starts_at, o.ends_at) is distinct from (d.starts_at, d.starts_at, d.ends_at);

  insert into public.event_occurrences (event_id, original_starts_at, starts_at, ends_at)
  select e.id, d.starts_at, d.starts_at, d.ends_at
  from public.event_desired_occurrences(e, horizon) d
  where not exists (
    select 1 from public.event_occurrences o
    where o.event_id = e.id
      and (o.original_starts_at at time zone e.time_zone)::date = (d.starts_at at time zone e.time_zone)::date
  )
  on conflict (event_id, original_starts_at) do nothing;

  perform set_config('skedgelife.syncing', 'off', true);
end;
$$;

-- Puts a changed date back to how its event schedules it: its slot's time and
-- the event's details. Removed if its slot is no longer in the schedule.
create function public.reset_occurrence(p_occurrence_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  o public.event_occurrences;
  e public.events;
begin
  select * into o from public.event_occurrences where id = p_occurrence_id;
  select * into e from public.events where id = o.event_id;
  if e.profile_id is distinct from (select auth.uid()) then
    raise exception 'Only the host can reset this date.' using errcode = '42501';
  end if;

  perform set_config('skedgelife.syncing', 'on', true);
  update public.event_occurrences set
    is_modified = false,
    starts_at = original_starts_at,
    ends_at = original_starts_at + coalesce(make_interval(mins => e.duration_minutes), e.ends_at - e.starts_at),
    title = null, description = null, format = null, venue_id = null, online_url = null, time_zone = null,
    capacity = null, booking_mode = null, booking_url = null, is_private_home = null, area = null
  where id = o.id;
  perform public.sync_event_occurrences(e.id);
end;
$$;

create function public.events_sync_occurrences()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.sync_event_occurrences(new.id);
  return null;
end;
$$;

create trigger events_sync_occurrences
  after insert or update of starts_at, ends_at, weekly_days, local_start_time, duration_minutes, repeat_until, time_zone, status
  on public.events
  for each row execute function public.events_sync_occurrences();

-- Keeps every weekly event 12 weeks ahead (#95). Run nightly by pg_cron.
create function public.extend_occurrence_windows()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_id uuid;
begin
  for event_id in
    select id from public.events
    where status = 'scheduled' and weekly_days is not null
      and (repeat_until is null or repeat_until >= current_date - 1)
  loop
    perform public.sync_event_occurrences(event_id);
  end loop;
end;
$$;

revoke execute on function public.sync_event_occurrences(uuid) from public, anon, authenticated;
revoke execute on function public.extend_occurrence_windows() from public, anon, authenticated;
revoke execute on function public.reset_occurrence(uuid) from public, anon;
grant execute on function public.reset_occurrence(uuid) to authenticated;

-- 10:15 UTC is the small hours across the US.
select cron.schedule('extend-event-occurrences', '15 10 * * *', 'select public.extend_occurrence_windows()');

-- A profile's upcoming dates, soonest first. Uses the server's clock for
-- "upcoming" (time rule 8). Runs with the caller's permissions, so policies
-- apply; unlisted events show only to their host.
create function public.upcoming_occurrences(p_profile_id uuid, p_limit integer default 200)
returns setof public.event_occurrences
language sql
stable
set search_path = ''
as $$
  select o.*
  from public.event_occurrences o
  join public.events e on e.id = o.event_id
  where e.profile_id = p_profile_id
    and o.ends_at > now()
    and (e.visibility = 'public' or e.profile_id = (select auth.uid()))
  order by o.starts_at
  limit p_limit;
$$;

-- Plan caps (#94) -----------------------------------------------------------

-- Free plan: 3 weekly slots and 1 larger group event a month (DECISIONS
-- 2026-10-03 and 2026-10-04). Weekly events always take a slot; a one-off for
-- 20 people or fewer takes a slot in its week (Monday to Sunday, in the
-- event's zone); a larger one-off (over 20, or no limit) counts toward the
-- monthly one. Paid: no caps. Mirrored in packages/data as EVENT_CAPS.
create function public.is_larger_event(capacity integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select capacity is null or capacity > 20;
$$;

create function public.enforce_event_caps()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_plan text;
  new_week date;
  over_week date;
  larger_count integer;
begin
  if new.status <> 'scheduled' then
    return new;
  end if;
  -- Only schedule, capacity, or status changes are checked, so an account that
  -- went over its caps (say, after downgrading) can still fix a typo.
  if tg_op = 'UPDATE' and old.status = 'scheduled'
    and (old.starts_at, old.weekly_days, old.repeat_until, old.capacity, old.time_zone)
      is not distinct from (new.starts_at, new.weekly_days, new.repeat_until, new.capacity, new.time_zone) then
    return new;
  end if;

  -- Lock the profile row so two saves at once can't both slip under the cap.
  select plan into owner_plan from public.profiles where id = new.profile_id for update;
  if owner_plan = 'paid' then
    return new;
  end if;

  if new.weekly_days is null and public.is_larger_event(new.capacity) then
    select count(*) into larger_count
    from public.events
    where profile_id = new.profile_id and id <> new.id and status = 'scheduled'
      and weekly_days is null and public.is_larger_event(capacity)
      and date_trunc('month', starts_at at time zone time_zone) = date_trunc('month', new.starts_at at time zone new.time_zone);
    if larger_count >= 1 then
      raise exception 'The free plan allows 1 larger group event (over 20 people, or no limit) a month. Upgrade for no limit.'
        using errcode = 'P0001', hint = 'event_cap_larger';
    end if;
    return new;
  end if;

  if new.weekly_days is null then
    new_week := date_trunc('week', new.starts_at at time zone new.time_zone)::date;
  end if;

  with evts as (
    select weekly_days, starts_at, ends_at, repeat_until, capacity, time_zone
    from public.events
    where profile_id = new.profile_id and id <> new.id and status = 'scheduled'
    union all
    select new.weekly_days, new.starts_at, new.ends_at, new.repeat_until, new.capacity, new.time_zone
  ),
  small_one_offs as (
    select date_trunc('week', starts_at at time zone time_zone)::date as week
    from evts
    where weekly_days is null and ends_at > now() and not public.is_larger_event(capacity)
  ),
  -- The weeks this event takes a slot in: its own week for a one-off; for a
  -- weekly event, this week and every week that already has a one-off.
  weeks as (
    select new_week as week where new_week is not null
    union
    select date_trunc('week', now() at time zone new.time_zone)::date where new.weekly_days is not null
    union
    select s.week from small_one_offs s
    where new.weekly_days is not null and (new.repeat_until is null or new.repeat_until >= s.week)
  )
  select w.week into over_week
  from weeks w
  where (select count(*) from evts where weekly_days is not null and (repeat_until is null or repeat_until >= w.week))
      + (select count(*) from small_one_offs s where s.week = w.week) > 3
  order by w.week
  limit 1;

  if over_week is not null then
    raise exception 'The free plan allows 3 weekly events (a one-off for 20 people or fewer uses a spot in its week). Upgrade for no limit.'
      using errcode = 'P0001', hint = 'event_cap_weekly';
  end if;
  return new;
end;
$$;

create trigger enforce_event_caps
  before insert or update on public.events
  for each row execute function public.enforce_event_caps();
