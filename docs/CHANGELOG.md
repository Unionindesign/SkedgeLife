# Changelog

A short entry for each working session. Newest first. Decision rationale goes in `docs/DECISIONS.md`; this file just records what changed.

## 2026-09-26

- PR #77 (Expo SDK 51 → 57) merged.
- Rewrote the README around what SkedgeLife is, what works today, what's in the works, and how to run it.
- Added `docs/dev/wsl.md` with WSL2 quirks: phone preview needs `--tunnel`, Windows Node on the PATH, files arriving as executable, 8.3 filenames, `gh` without sudo.
- Decisions (`docs/DECISIONS.md`): Supabase backend; one profile type for every account, with a free/paid plan open to anyone (replaces separate `StudentProfile` and instructors-only paid tier); single handle namespace with custom domains as the paid perk (replaces `/i/` vs `/u/`); monorepo layout. Plan docs and README updated to match.
- GitHub: closed #69 and #16 as resolved, retitled issues for the one-profile model, renamed the "Student Free-Tier" milestone to "Free Profile Pages & Page Builder", added #79 (monorepo) and #80 (custom domains).
- Branch `feature/monorepo` (#79): moved the Expo app to `apps/mobile` (history kept), extracted `packages/types` and `packages/skins`, added an `apps/web` placeholder and an npm workspaces root. The app now starts from `apps/mobile/index.ts`. Run `npm start` / `npm run web` from the root.
- Branch `feature/supabase-local` (#5, #6, #7):
  - Supabase CLI as a root dev dependency; `supabase/` initialized, with realtime, edge functions, analytics, and vector storage off for now.
  - First migration: `profiles` (one per account; handle format and reserved-words checks; `teaches` marker; `plan` not user-editable), created automatically on sign-up. Content tables for schedule entries and times, services, private sessions, testimonials, and gallery. Row-level security everywhere: public read, owner-only writes.
  - `supabase/seed.sql` with Michelle's profile and a local login.
  - Generated database types in `packages/types`; `npm run db:start|stop|reset|types` scripts; `docs/dev/supabase.md`.
- Added #82: create the hosted Supabase project once the local backend work is done.

## 2026-09-24

- Added this changelog.
- GitHub setup (no repo files changed): created 18 milestones (Foundation phases, Epics 1-11, two extra features), a lean label set (`area:*`, `priority:now/next/later`, `status:blocked`, `research`), and 74 triaged issues.
- Branch `feature/stabilize-skeleton`:
  - Confirmed `npm install`, `npm run typecheck`, and Android/web bundling all pass with no code changes (#1, #4).
  - Loaded the `classic-yoga` fonts (Arvo, Great Vibes) in `App.tsx` and applied them to the profile screen: Arvo on section headings, Great Vibes on the instructor name (#2).
  - Default skin now uses the platform system font instead of the string `"System"`.
  - Removed stale "not yet verified" notes from the README and profile screen.
  - App icon/splash (#3) left open: no brand assets yet.
  - Merged as PR #75.
- Branch `feature/expo-sdk-upgrade` (#76):
  - Upgraded Expo SDK 51 → 57 one version at a time: React Native 0.74 → 0.86, React 18 → 19, Reanimated 3 → 4. The app now runs in the current Expo Go on iOS.
  - React Navigation 6 → 7; removed the unused `@react-navigation/native-stack`.
  - Added `expo-asset`, `react-native-worklets`, and `babel-preset-expo` as direct dependencies; removed the explicit Reanimated Babel plugin (the Expo preset adds it).
  - `tsconfig.json`: dropped `baseUrl` (deprecated in TypeScript 6); the `@/` alias still works.
  - `app.json`: removed the top-level `splash` key, which SDK 56+ rejects.
  - README: replaced the stale "never been run" intro; added phone preview steps for WSL2 + Expo Go.

## 2026-08-23 — `e95da1f`

- Added `docs/plans/2026-08-22-video-content-and-live-streaming.md`: video library, marketing blasts, live streaming, video series, plus early hosting research.
- Added Epics 8-11 to `docs/reference/SKEDGE~1.MD`, based on the UX interview with Michelle Scutti.
- Added `docs/DECISIONS.md` with the first decisions: domain, tier scope, `StudentProfile` type, monorepo, slug split, Stripe, and the mobile-first page builder.
- Updated the general plan and NextJS SSR architecture docs to match.

## 2026-08-01 — `15df0e9`

- Added `docs/plans/` with the general plan of approach and the NextJS SSR web architecture doc.
- Added the reference docs (`SKEDGE~1.MD` user stories, `WILD-R~1.MD` seed content).

## 2026-07-31 — `463c7f5`

- Initial Expo + TypeScript scaffold: Instructor Profile, Schedule, and Sequence Builder screens running on seed data.
