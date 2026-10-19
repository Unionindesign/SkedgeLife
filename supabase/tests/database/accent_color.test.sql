-- Your own accent color (migration accent_color, #43).
-- Run with `npm run test:db` (local Supabase must be running).
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000011', 'authenticated', 'authenticated', 'accent@test.local', '{"handle":"test_accent"}'),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000012', 'authenticated', 'authenticated', 'nosy@test.local', '{"handle":"test_nosy"}');

select is((select accent_color from profiles where handle = 'test_accent'), null, 'new profiles use the skin''s accent');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000011","role":"authenticated"}', true);

select lives_ok($$ update profiles set accent_color = '#6a1b9a' where id = 'aaaaaaaa-0000-4000-8000-000000000011' $$,
  'an owner can set their accent color');
select throws_ok($$ update profiles set accent_color = '#6A1B9A' where id = 'aaaaaaaa-0000-4000-8000-000000000011' $$,
  '23514', null, 'colors are stored lowercase');
select throws_ok($$ update profiles set accent_color = 'purple' where id = 'aaaaaaaa-0000-4000-8000-000000000011' $$,
  '23514', null, 'only #rrggbb colors are stored');

-- Another user's update matches no rows under row-level security.
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000012","role":"authenticated"}', true);
update profiles set accent_color = '#000000' where id = 'aaaaaaaa-0000-4000-8000-000000000011';
reset role;
select is((select accent_color from profiles where handle = 'test_accent'), '#6a1b9a', 'nobody else can change it');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000011","role":"authenticated"}', true);
update profiles set accent_color = null where id = 'aaaaaaaa-0000-4000-8000-000000000011';
reset role;
select is((select accent_color from profiles where handle = 'test_accent'), null, 'an owner can go back to the skin''s accent');

select * from finish();
rollback;
