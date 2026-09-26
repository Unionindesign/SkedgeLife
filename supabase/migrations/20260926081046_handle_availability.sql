-- Lets the sign-up screen check a handle as the user types, using the same
-- rules as the profiles table so they're defined in one place.
create function public.is_handle_available(h text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(h) ~ '^[a-z0-9_]{3,30}$'
    and not public.is_reserved_handle(h)
    and not exists (select 1 from public.profiles p where p.handle = lower(h));
$$;

grant execute on function public.is_handle_available(text) to anon, authenticated;
