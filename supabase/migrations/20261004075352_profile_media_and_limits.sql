-- Photo storage, gallery limits by plan, and length limits on page content.

-- Storage --------------------------------------------------------------------

-- Profile photos, logos, and gallery images. Public read, so pages can show
-- them without signing in. Files live at <user id>/<random id>.<ext>, and
-- only the owner can write inside their folder. The app compresses images
-- before upload (server-side transforms need a paid Supabase plan).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Deleting a file through the API needs select as well as delete.
create policy "Owners read their media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Gallery limit --------------------------------------------------------------

-- Free: 3 gallery photos; paid: 30 (DECISIONS 2026-10-04). Mirrored in
-- packages/data as GALLERY_LIMITS.
create function public.gallery_limit(plan text)
returns integer
language sql
immutable
as $$
  select case plan when 'paid' then 30 else 3 end;
$$;

create function public.enforce_gallery_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_plan text;
  current_count integer;
begin
  -- Lock the profile row so two uploads at once can't both slip under the limit.
  select plan into owner_plan from public.profiles where id = new.profile_id for update;
  select count(*) into current_count from public.gallery_images where profile_id = new.profile_id;
  if current_count >= public.gallery_limit(owner_plan) then
    raise exception 'Your plan allows up to % gallery photos.', public.gallery_limit(owner_plan)
      using errcode = 'P0001', hint = 'gallery_limit';
  end if;
  return new;
end;
$$;

create trigger enforce_gallery_limit
  before insert on public.gallery_images
  for each row execute function public.enforce_gallery_limit();

-- Length limits --------------------------------------------------------------

-- Mirrored in the app's editors as character counters.
alter table public.service_modalities
  add constraint service_modalities_title_length check (char_length(title) between 1 and 80),
  add constraint service_modalities_description_length check (char_length(description) <= 1000);

alter table public.private_session_types
  add constraint private_session_types_title_length check (char_length(title) between 1 and 80),
  add constraint private_session_types_description_length check (char_length(description) <= 1000);

alter table public.testimonials
  add constraint testimonials_quote_length check (char_length(quote) between 1 and 500),
  add constraint testimonials_author_name_length check (char_length(author_name) between 1 and 80),
  add constraint testimonials_author_location_length check (char_length(author_location) <= 80);

alter table public.gallery_images
  add constraint gallery_images_caption_length check (char_length(caption) <= 200);
