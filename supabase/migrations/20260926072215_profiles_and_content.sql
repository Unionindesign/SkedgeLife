-- One profile per account, plus the content shown on a profile page.
-- Model decided 2026-09-26: one profile type for everyone (docs/DECISIONS.md).

-- Handles -------------------------------------------------------------------

-- Changing this list requires a new migration.
create function public.is_reserved_handle(h text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select lower(h) = any (array[
    'about', 'account', 'admin', 'api', 'app', 'auth', 'blog', 'dashboard',
    'explore', 'help', 'home', 'legal', 'login', 'logout', 'me', 'new',
    'privacy', 'profile', 'search', 'settings', 'signup', 'skedgelife',
    'support', 'terms', 'www'
  ]);
$$;

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null unique
    constraint handle_format check (handle ~ '^[a-z0-9_]{3,30}$')
    constraint handle_not_reserved check (not public.is_reserved_handle(handle)),
  display_name text not null check (char_length(display_name) between 1 and 80),
  bio_short text check (char_length(bio_short) <= 280),
  bio_long text check (char_length(bio_long) <= 5000),
  avatar_url text,
  logo_url text,
  interests text[] not null default '{}',
  teaches boolean not null default false,
  certifications text[] not null default '{}',
  specialties text[] not null default '{}',
  contact_email text,
  contact_phone text,
  instagram_handle text,
  skin text not null default 'default' check (skin in ('default', 'classic-yoga')),
  plan text not null default 'free' check (plan in ('free', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Rows are created by the sign-up trigger below and deleted with the auth user.
-- Users can edit their own profile but not id, plan, or timestamps; plan
-- changes come from billing.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (
  handle, display_name, bio_short, bio_long, avatar_url, logo_url, interests,
  teaches, certifications, specialties, contact_email, contact_phone,
  instagram_handle, skin
) on public.profiles to authenticated;

-- Create a profile for every new auth user. The sign-up call can pass
-- `handle` and `display_name` in user metadata; otherwise fall back to a
-- generated handle. An invalid or taken handle fails the sign-up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    coalesce(
      lower(nullif(new.raw_user_meta_data ->> 'handle', '')),
      'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'New member'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profile content -----------------------------------------------------------

create table public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  venue_name text not null,
  venue_logo_url text,
  address text,
  booking_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.service_modalities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.private_session_types (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  quote text not null,
  author_name text not null,
  author_location text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Same rules for every profile-owned table: anyone can read, only the owner
-- can write.
do $$
declare
  t text;
begin
  foreach t in array array[
    'schedule_entries', 'service_modalities', 'private_session_types',
    'testimonials', 'gallery_images'
  ] loop
    execute format('create index on public.%I (profile_id, sort_order)', t);
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format(
      'create policy "Owner insert" on public.%I for insert to authenticated with check ((select auth.uid()) = profile_id)', t);
    execute format(
      'create policy "Owner update" on public.%I for update to authenticated using ((select auth.uid()) = profile_id) with check ((select auth.uid()) = profile_id)', t);
    execute format(
      'create policy "Owner delete" on public.%I for delete to authenticated using ((select auth.uid()) = profile_id)', t);
  end loop;
end;
$$;

-- Class times belong to a schedule entry, so ownership goes through it.
create table public.schedule_times (
  id uuid primary key default gen_random_uuid(),
  schedule_entry_id uuid not null references public.schedule_entries (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  label text not null,
  sort_order integer not null default 0
);

create index on public.schedule_times (schedule_entry_id, sort_order);

alter table public.schedule_times enable row level security;

create function public.owns_schedule_entry(entry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.schedule_entries e
    where e.id = entry_id and e.profile_id = (select auth.uid())
  );
$$;

create policy "Public read"
  on public.schedule_times for select
  to anon, authenticated
  using (true);

create policy "Owner insert"
  on public.schedule_times for insert
  to authenticated
  with check (public.owns_schedule_entry(schedule_entry_id));

create policy "Owner update"
  on public.schedule_times for update
  to authenticated
  using (public.owns_schedule_entry(schedule_entry_id))
  with check (public.owns_schedule_entry(schedule_entry_id));

create policy "Owner delete"
  on public.schedule_times for delete
  to authenticated
  using (public.owns_schedule_entry(schedule_entry_id));
