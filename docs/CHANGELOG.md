# Changelog

A short entry for each working session. Newest first. Decision rationale goes in `docs/DECISIONS.md`; this file just records what changed.

## 2026-09-24

- Added this changelog.
- GitHub setup (no repo files changed): created 18 milestones (Foundation phases, Epics 1-11, two extra features), a lean label set (`area:*`, `priority:now/next/later`, `status:blocked`, `research`), and 74 triaged issues.
- Branch `feature/stabilize-skeleton`:
  - Confirmed `npm install`, `npm run typecheck`, and Android/web bundling all pass with no code changes (#1, #4).
  - Loaded the `classic-yoga` fonts (Arvo, Great Vibes) in `App.tsx` and applied them to the profile screen: Arvo on section headings, Great Vibes on the instructor name (#2).
  - Default skin now uses the platform system font instead of the string `"System"`.
  - Removed stale "not yet verified" notes from the README and profile screen.
  - App icon/splash (#3) left open: no brand assets yet.

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
