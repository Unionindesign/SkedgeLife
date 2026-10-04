# Changelog

A short entry for each working session. Newest first. Decision rationale goes in `docs/DECISIONS.md`; this file just records what changed.

## 2026-10-04

- Branch `feature/self-serve-editing` (milestone "Foundation: Auth & Self-Serve Editing"; plan `docs/plans/2026-10-03-foundation-self-serve-editing.md`). The first PR built with the plan-then-one-branch workflow.
  - **Tabs are now Schedule · Profile · Website**, with icons, opening on Profile. The Sequence Builder moved off the tab bar to a "Sequences" button on Schedule (shown when "I teach" is on).
  - **Profile vs Website:** the Profile tab shows the ordinary profile. Logo, services, privates, testimonials, and gallery moved to the new Website tab, which lists each section with an editor and has a full-page **Preview** with the skin.
  - **Photos:** profile photo (Edit profile), logo (Website → Look), and gallery, picked from the library or camera, resized and compressed on the phone (`expo-image-picker`, `expo-image-manipulator`), and uploaded to a new `profile-media` storage bucket. Photo columns store storage paths; replaced or deleted photos remove their files.
  - **Editors:** one list editor for services, private sessions, and testimonials (add, edit, delete, drag to reorder); gallery editor with captions, reorder, delete, and a "3 of 3 photos" limit with an upgrade note. The skin picker moved from Edit profile to Website → Look.
  - **Database** (migration `profile_media_and_limits`): storage bucket and owner-only file policies; gallery limit by plan (free 3, paid 30) enforced by a trigger; length limits on services, privates, testimonials, and captions. The seed profile is now on the paid plan.
  - **`packages/data`:** split into `auth`, `content`, and `media` modules: sign-up, log-in, log-out, content add/update/delete/reorder, photo upload, removal, and URLs.
  - **#14:** sign-in functions shared in `packages/data`; `docs/dev/auth.md` explains how the web app will share accounts; local auth redirect URLs point at the Next.js dev server.
  - `expo` patch bump to 57.0.26 so `expo-doctor` passes.
- Closed #11 (done in #86) and #13 (superseded by #93). Filed milestone "Scheduling 1: Real times" (#90–#95) and created milestones for scheduling phases 2–5. Unblocked #94: a larger group event is capacity over 20 or no cap.
- Decisions: free-plan photo limits, no caps on text sections, owner-entered testimonials, the new tab layout, the larger-event definition, and photos saving right away.

## 2026-10-03

- PR #87 (Edit profile) merged.
- Phone preview working: Expo Go against the hosted Supabase project. The hosted project had paused after a week idle (free plan) and was restored.
- Product direction: SkedgeLife is a scheduling app first. Added `docs/plans/2026-10-03-scheduling-events-and-bookings.md`: events with real times and places, discovery by area, time, and interests, RSVPs and paid bookings, Calendly-style appointments on the paid plan, a map provider comparison, and five proposed phases.
- New rules in `docs/rules/`: `time.md` (UTC `timestamptz`, IANA zones, ISO 8601, local display), `database.md`, `code.md`, `milestones.md`, plus a `README.md` index. `CLAUDE.md` links them.
- Decisions: scheduling-first direction, the time rule, free-plan caps (3 weekly recurring events, 1 larger group event a month), free RSVPs, optional address hiding for home events, Mapbox.
- PR #89 (scheduling plan and rules) merged.
- Workflow rules updated (pushed straight to `main`, user OK'd): plans are reviewed uncommitted, not as PRs; once approved, a feature or milestone lands as one branch and one PR covering plan, database, backend, frontend, and docs; stacked PRs are allowed with care (`docs/rules/milestones.md`, `docs/rules/pull-requests.md`).
- Hosted Supabase minimum password length confirmed at 8.
- TODO: marked phone preview and hosted `.env` done; added rows for the plan's open questions, Mapbox tokens, an EAS development build, and upgrading Supabase before launch.

## 2026-09-26

- Added `CLAUDE.md` and `docs/rules/` (`pull-requests.md`, `model-selection.md`) so a new session can pick up the working rules without the prior conversation: where things live, the session-start routine, no-stacked-PRs, never pushing feature work to `main`, pre-push checks, and when to suggest switching models. Pushed straight to `main` (docs-only, user OK'd).
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
  - `docs/dev/wsl.md`: Docker runs inside WSL, not Docker Desktop (keep Desktop closed); Windows tools like DBeaver reach WSL services via `localhost`; Expo can print an unreachable Docker bridge address; React Native DevTools needs `libnss3`.
- Added #82: create the hosted Supabase project once the local backend work is done.
- Added `docs/TODO.md`: a running list of things that need a person (accounts, decisions, follow-ups), linked to issues.
- #81 and #83 merged into their stacked base branches rather than `main`; catch-up PR #84 brought that work to `main`.
- Hosted Supabase project created (`wiizhsznblwkiuzkchzw`), not linked yet.
- Branch `feature/app-reads-supabase` (#8, #9):
  - New `packages/data` with `getProfilePage()`: one typed request for a profile and all its page content.
  - The app loads the profile once (`ProfileProvider`) and the Profile and Schedule screens render from it, with loading, error (with "Try again"), and not-found states. The Sequence Builder takes the author name from it.
  - Supabase settings come from `apps/mobile/.env` (`.env.example` committed with local defaults; `.env` files now gitignored).
  - Removed the TypeScript seed file and the hand-written profile types (replaced by `supabase/seed.sql` and the generated database types). Added `getSkin()` for skins stored as text.
  - The PDF sequence card now HTML-escapes the title, quote, playlist, author, and pose names.
  - Merged as PR #85.
- Branch `feature/auth` (#10):
  - Welcome, Sign up, and Log in screens; Log out on the Profile tab. The session is saved on the device and refreshed in the foreground.
  - Sign-up checks the handle as you type via a new `is_handle_available` database function (migration `handle_availability`), so format and reserved-word rules live only in the database.
  - The tabs show the signed-in user's own profile; the hard-coded demo handle is gone. Empty profile sections are hidden, with a "your page is ready" note on new profiles.
  - Local minimum password length raised to 8.
  - Decisions logged (email + password first, confirmation off until launch; welcome screen then your own profile). TODO rows added for the hosted dashboard settings and a real email service before launch.
  - Merged as PR #86.
- Hosted project linked and both migrations pushed; closed #82. Closed #26 (done in #85).
- Branch `feature/profile-editing` (part of #12):
  - **Edit profile** screen, opened from the profile page as a modal: name, short bio, about, interests, an "I teach" switch revealing specialties and certifications, contact details, and a skin picker. Character counters match the database limits; Save is enabled only when something changed and everything is valid.
  - Reusable `TagEditor` (add with return or Add, remove with ×, no duplicates, up to 20).
  - `updateProfile()` in `packages/data`, limited to the columns users may edit.
  - The profile page shows interests, and only shows teaching sections when "I teach" is on. Saving refreshes the page without a spinner flash.
  - Photos (headshot, logo, gallery), services/privates/testimonials editors, schedule editing, and rates come in later PRs.

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
