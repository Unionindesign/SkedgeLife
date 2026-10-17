-- Moves the old free-text schedule onto venues and weekly events (#91), then
-- drops it. Each label such as '5:30pm Hot Ra' becomes a 17:30 start and the
-- title 'Hot Ra'; the same class at the same time on several days becomes one
-- weekly event. Every host so far is in Southern California, so zones default
-- to America/Los_Angeles and classes to 60 minutes; hosts can change both.

insert into public.venues (id, created_by, name, address, time_zone, logo_url, booking_url)
select id, profile_id, left(venue_name, 120), left(address, 300), 'America/Los_Angeles', venue_logo_url, left(booking_url, 500)
from public.schedule_entries;

-- Imported as they were, even past the free plan's caps.
alter table public.events disable trigger enforce_event_caps;

with parsed as (
  select
    se.id as venue_id,
    se.profile_id,
    se.booking_url,
    st.day_of_week,
    left(coalesce(nullif(trim(r.m[4]), ''), se.venue_name), 120) as title,
    make_time((r.m[1]::int % 12) + case when lower(r.m[3]) = 'p' then 12 else 0 end, coalesce(r.m[2], '0')::int, 0) as start_time
  from public.schedule_times st
  join public.schedule_entries se on se.id = st.schedule_entry_id
  cross join lateral regexp_match(st.label, '^\s*(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?\s*[-–:]?\s*(.*)$', 'i') as r(m)
  where r.m is not null and r.m[1]::int between 1 and 12
)
insert into public.events (
  profile_id, title, venue_id, format, time_zone, weekly_days, local_start_time, duration_minutes, booking_mode, booking_url
)
select
  profile_id, title, venue_id, 'in_person', 'America/Los_Angeles',
  array_agg(distinct day_of_week order by day_of_week), start_time, 60,
  case when booking_url is null then 'rsvp' else 'external_link' end, left(booking_url, 500)
from parsed
group by profile_id, venue_id, booking_url, title, start_time;

alter table public.events enable trigger enforce_event_caps;

-- Labels without a recognisable time can't become events; list them in the
-- migration output rather than failing the push.
do $$
declare
  skipped record;
begin
  for skipped in
    select se.venue_name, st.day_of_week, st.label
    from public.schedule_times st
    join public.schedule_entries se on se.id = st.schedule_entry_id
    where regexp_match(st.label, '^\s*(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?', 'i') is null
  loop
    raise warning 'Not migrated (no time in label): % / day % / %', skipped.venue_name, skipped.day_of_week, skipped.label;
  end loop;
end;
$$;

drop table public.schedule_times;
drop table public.schedule_entries;
drop function public.owns_schedule_entry(uuid);
