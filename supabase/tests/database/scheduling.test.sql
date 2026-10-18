-- Scheduling rules (migration scheduling_real_times): date generation,
-- per-date changes, free-plan caps, time zones, and access rules.
-- Run with `npm run test:db` (local Supabase must be running). Dates are
-- relative to today, so the tests keep working as time passes.
begin;
create extension if not exists pgtap with schema extensions;
select plan(28);

-- Fixtures: a free host (A) with a public studio and a private home, and another user (B).
insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'host@test.local', '{"handle":"test_host"}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'other@test.local', '{"handle":"test_other"}');
insert into venues (id, created_by, name, time_zone) values
  ('bbbbbbbb-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'Studio', 'America/Los_Angeles');
insert into venues (id, created_by, name, address, time_zone, is_private) values
  ('bbbbbbbb-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001', 'Home', '1 Secret St', 'America/Los_Angeles', true);

-- A weekly Monday class at 09:00 Los Angeles time.
insert into events (id, profile_id, title, venue_id, time_zone, weekly_days, local_start_time, duration_minutes)
values ('cccccccc-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'Monday flow',
        'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles', '{1}', '09:00', 60);

create temporary view monday as
  select o.*, row_number() over (order by original_starts_at) as n,
         (starts_at at time zone 'America/Los_Angeles') as local
  from event_occurrences o where event_id = 'cccccccc-0000-4000-8000-000000000001';
grant select on monday to authenticated;

-- Generation -----------------------------------------------------------------

select is((select count(*)::int from monday), 12, 'a weekly event gets 12 weeks of dates');
-- 09:00 local stays 09:00 whatever the UTC offset, so daylight-saving changes don't move the class.
select is((select count(*)::int from monday where local::time <> '09:00' or extract(dow from local) <> 1), 0,
  'every date is a Monday at 09:00 local time');
select is((select count(*)::int from monday where ends_at - starts_at <> interval '60 minutes'), 0, 'every date lasts 60 minutes');

-- Regeneration ---------------------------------------------------------------

update event_occurrences set status = 'cancelled' where id = (select id from monday where n = 2);
update events set local_start_time = '10:00' where id = 'cccccccc-0000-4000-8000-000000000001';
select is((select status from monday where n = 2), 'cancelled', 'a cancelled date stays cancelled when the time changes');
select is((select count(*)::int from monday where local::time <> '10:00'), 0, 'every date moves to the new time');

update events set weekly_days = '{2}' where id = 'cccccccc-0000-4000-8000-000000000001';
select is((select count(*)::int from monday where status = 'cancelled'), 0, 'a cancelled date goes when its day leaves the pattern');
select is((select count(*)::int from monday where extract(dow from local) <> 2), 0, 'dates move to the new day');

update events set status = 'cancelled' where id = 'cccccccc-0000-4000-8000-000000000001';
select is((select count(*)::int from monday where status <> 'cancelled'), 0, 'cancelling an event cancels every date');

-- Per-date changes -------------------------------------------------------------

insert into events (id, profile_id, title, venue_id, time_zone, weekly_days, local_start_time, duration_minutes)
values ('cccccccc-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001', 'Wednesday flow',
        'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles', '{3}', '18:00', 60);
create temporary view wednesday as
  select o.*, row_number() over (order by original_starts_at) as n
  from event_occurrences o where event_id = 'cccccccc-0000-4000-8000-000000000002';
grant select on wednesday to authenticated;
create temporary table moved as select id, starts_at + interval '1 day 2 hours' as new_start from wednesday where n = 3;
grant select on moved to authenticated;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}', true);
update event_occurrences o set starts_at = m.new_start, ends_at = m.new_start + interval '1 hour', title = 'Moved flow'
from moved m where o.id = m.id;
reset role;
select ok((select is_modified from event_occurrences where id = (select id from moved)), 'a host change marks the date as modified');

update events set local_start_time = '19:00' where id = 'cccccccc-0000-4000-8000-000000000002';
select is((select starts_at from event_occurrences where id = (select id from moved)), (select new_start from moved),
  'a modified date keeps its own time through series edits');
select is((select count(*)::int from wednesday), 12, 'the slot a modified date came from is not refilled');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}', true);
select throws_ok(
  $$update event_occurrences set format = 'online' where id = (select id from wednesday where n = 4)$$,
  '23514', null, 'an online date needs a link');
select throws_ok(
  $$update event_occurrences set original_starts_at = now() where id = (select id from moved)$$,
  '42501', null, 'hosts cannot rewrite which slot a date fills');
select lives_ok($$select reset_occurrence((select id from moved))$$, 'the host can undo changes to a date');
reset role;
select ok(
  (select not is_modified and title is null and (starts_at at time zone 'America/Los_Angeles')::time = '19:00'
   from event_occurrences where id = (select id from moved)),
  'undoing puts the date back on the series time and details');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000002","role":"authenticated"}', true);
select throws_ok($$select reset_occurrence((select id from moved))$$, '42501', null, 'other users cannot undo dates');
update event_occurrences set title = 'Hijacked' where event_id = 'cccccccc-0000-4000-8000-000000000002';
reset role;
select is((select count(*)::int from wednesday where title = 'Hijacked'), 0, 'other users cannot change dates');

-- Free-plan caps ---------------------------------------------------------------

-- Wednesday flow is one weekly slot (Monday flow is cancelled); add a second, then a third.
insert into events (profile_id, title, venue_id, time_zone, weekly_days, local_start_time, duration_minutes)
values ('aaaaaaaa-0000-4000-8000-000000000001', 'Weekly 2', 'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles', '{4}', '18:00', 60);
select lives_ok(
  $$insert into events (profile_id, title, venue_id, time_zone, weekly_days, local_start_time, duration_minutes)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 'Weekly 3', 'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles', '{5}', '18:00', 60)$$,
  'a free host can have 3 weekly events');
select throws_ok(
  $$insert into events (profile_id, title, venue_id, time_zone, weekly_days, local_start_time, duration_minutes)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 'Weekly 4', 'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles', '{6}', '18:00', 60)$$,
  'P0001', null, 'but not a 4th');
select throws_ok(
  $$insert into events (profile_id, title, venue_id, time_zone, starts_at, ends_at, capacity)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 'Hike', 'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles',
            now() + interval '30 days', now() + interval '30 days 2 hours', 8)$$,
  'P0001', null, 'a small one-off uses a weekly slot, so a full week refuses it');
update events set repeat_until = current_date + 7 where title = 'Weekly 3' and profile_id = 'aaaaaaaa-0000-4000-8000-000000000001';
select lives_ok(
  $$insert into events (profile_id, title, venue_id, time_zone, starts_at, ends_at, capacity)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 'Hike', 'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles',
            now() + interval '30 days', now() + interval '30 days 2 hours', 8)$$,
  'a small one-off fits once a weekly event has ended');
select lives_ok(
  $$insert into events (profile_id, title, venue_id, time_zone, starts_at, ends_at)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 'Festival', 'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles',
            date_trunc('month', now() + interval '3 months') + interval '9 days 18 hours',
            date_trunc('month', now() + interval '3 months') + interval '9 days 22 hours')$$,
  'one larger event a month is allowed');
select throws_ok(
  $$insert into events (profile_id, title, venue_id, time_zone, starts_at, ends_at, capacity)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 'Festival 2', 'bbbbbbbb-0000-4000-8000-000000000001', 'America/Los_Angeles',
            date_trunc('month', now() + interval '3 months') + interval '19 days 18 hours',
            date_trunc('month', now() + interval '3 months') + interval '19 days 22 hours', 50)$$,
  'P0001', null, 'but not a second in the same month');
select lives_ok(
  $$update events set title = 'Weekly two' where title = 'Weekly 2' and profile_id = 'aaaaaaaa-0000-4000-8000-000000000001'$$,
  'text edits are never blocked by the caps');

-- Time zones -----------------------------------------------------------------

select ok(is_time_zone('America/Los_Angeles') and is_time_zone('UTC'), 'IANA zones are accepted');
select ok(not is_time_zone('PST') and not is_time_zone('-07:00') and not is_time_zone('Mars/Base'),
  'abbreviations, offsets, and made-up zones are refused');

-- Access rules -----------------------------------------------------------------

set local role anon;
select is((select count(*)::int from venues where is_private), 0, 'visitors cannot see private venues');
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000002","role":"authenticated"}', true);
select throws_ok(
  $$insert into events (profile_id, title, venue_id, time_zone, starts_at, ends_at, capacity)
    values ('aaaaaaaa-0000-4000-8000-000000000002', 'Sneaky', 'bbbbbbbb-0000-4000-8000-000000000002', 'America/Los_Angeles',
            now() + interval '10 days', now() + interval '10 days 2 hours', 5)$$,
  '42501', null, 'nobody can attach someone else''s private venue');
reset role;

select * from finish();
rollback;
