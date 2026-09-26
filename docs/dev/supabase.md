# Local Supabase

The backend runs locally in Docker via the Supabase CLI, which is a dev dependency, so there's nothing to install globally. There's no hosted project yet (tracked in #82).

## Everyday commands

Run from the repo root:

| Command | What it does |
|---|---|
| `npm run db:start` | Start the local stack. The first run downloads Docker images and takes a few minutes. |
| `npm run db:stop` | Stop it. Data is kept until the next reset. |
| `npm run db:reset` | Wipe the local database, re-run every migration, and load `supabase/seed.sql`. |
| `npm run db:types` | Regenerate `packages/types/src/database.ts` from the local schema. |
| `npx supabase status` | Show local URLs and keys. |

## Local URLs

- API: http://127.0.0.1:54321
- Studio (browse tables, run SQL): http://127.0.0.1:54323
- Email inbox for auth emails (Mailpit): http://127.0.0.1:54324
- Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

The keys `supabase status` prints are fixed, well-known development keys. They're fine to use locally and useless anywhere else. Never put hosted-project keys in git; they go in an untracked `.env` file.

## Seed data

`supabase/seed.sql` loads Michelle Scutti's profile (handle `michellescutti`) with her schedule, services, testimonials, and gallery. It also creates a local login:

- Email: `michelle@skedgelife.test`
- Password: `skedgelife-dev`

## Changing the schema

1. `npx supabase migration new <short_name>` creates a timestamped file in `supabase/migrations/`.
2. Write the SQL. Enable row-level security on every new table and add policies.
3. `npm run db:reset` applies it from scratch, along with the seed.
4. `npm run db:types` regenerates the TypeScript types, which get committed along with the migration.

Never edit a migration that has been merged. Add a new one instead.

## What's turned off

Realtime, edge functions, analytics, and vector storage are disabled in `supabase/config.toml` to keep the local stack light. Turn them on when a feature needs them.
