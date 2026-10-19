-- Three new skins (#41). Must match SkinId in packages/types and the skins in
-- packages/skins.
alter table public.profiles
  drop constraint profiles_skin_check,
  add constraint profiles_skin_check check (skin in ('default', 'classic-yoga', 'calm', 'bold', 'trail'));
