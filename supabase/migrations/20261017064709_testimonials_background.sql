-- A background photo behind the testimonials section (shown with a parallax
-- effect, #99), and room for longer testimonials.

-- A storage path, like the other photo columns.
alter table public.profiles add column testimonials_background_url text;
grant update (testimonials_background_url) on public.profiles to authenticated;

-- Real testimonials run longer than 500 characters (Michelle's do). Mirrored
-- in the app's testimonial editor.
alter table public.testimonials
  drop constraint testimonials_quote_length,
  add constraint testimonials_quote_length check (char_length(quote) between 1 and 1000);
