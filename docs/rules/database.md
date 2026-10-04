# Database (Supabase)

Linked from [CLAUDE.md](../../CLAUDE.md). Day-to-day commands are in [docs/dev/supabase.md](../dev/supabase.md); this file is the rules.

- **Schema changes go in a new migration** (`npx supabase migration new <name>`). Never edit a merged migration.
- **Row-level security on every table**, with policies. The default is public read and owner-only write; anything private (bookings, contact details for attendees) gets tighter read policies.
- **Rules live in the database:** formats, limits, reserved words, and plan caps. The app mirrors them for instant feedback, with a comment saying where they come from (e.g. `// Limits match the check constraints on public.profiles.`).
- **After a schema change:** `npm run db:reset`, then `npm run db:types`, and commit the regenerated `packages/types/src/database.ts` with the migration.
- **Queries live in `packages/data`** as typed functions that take the client, so the web app can reuse them. Screens don't build queries inline.
- **Times follow [time.md](time.md).**
- **The hosted project is the user's to change.** Don't run `npx supabase db push` or change dashboard settings; add a `docs/TODO.md` row when a merge needs one.
- The free plan pauses the hosted project after about a week of inactivity. If hosted calls fail, check that first.
