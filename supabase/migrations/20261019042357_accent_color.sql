-- Your own accent color (#43). Null uses the skin's accent. Stored as
-- lowercase #rrggbb; the app checks it's dark enough to read on white
-- (isReadableAccent in packages/skins), and pages ignore a value they can't use.
alter table public.profiles
  add column accent_color text,
  add constraint profiles_accent_color_hex check (accent_color ~ '^#[0-9a-f]{6}$');
grant update (accent_color) on public.profiles to authenticated;
