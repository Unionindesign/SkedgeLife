-- Skins a profile may use (migration more_skins, #41).
-- Run with `npm run test:db` (local Supabase must be running).
begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000021', 'authenticated', 'authenticated', 'skins@test.local', '{"handle":"test_skins"}');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000021","role":"authenticated"}', true);

select lives_ok($$ update profiles set skin = 'calm' where id = 'aaaaaaaa-0000-4000-8000-000000000021' $$, 'Calm is a skin');
select lives_ok($$ update profiles set skin = 'bold' where id = 'aaaaaaaa-0000-4000-8000-000000000021' $$, 'Bold is a skin');
select lives_ok($$ update profiles set skin = 'trail' where id = 'aaaaaaaa-0000-4000-8000-000000000021' $$, 'Trail is a skin');
select lives_ok($$ update profiles set skin = 'classic-yoga' where id = 'aaaaaaaa-0000-4000-8000-000000000021' $$, 'the existing skins still work');
select throws_ok($$ update profiles set skin = 'neon' where id = 'aaaaaaaa-0000-4000-8000-000000000021' $$,
  '23514', null, 'an unknown skin is refused');

select * from finish();
rollback;
