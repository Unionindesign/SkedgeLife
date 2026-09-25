# SkedgeLife (mobile app skeleton)

Expo + TypeScript React Native app. This skeleton was hand-written in a sandboxed
environment that could not reach the npm registry (network allowlist blocked it),
so **none of this has been run or type-checked yet** — treat it as a solid
starting point to `npm install` and iterate on in your real dev environment (WSL2).

## Setup (run in WSL2)

```bash
cd ~/Projects/SkedgeLife   # wherever you unzip this
npm install
npx expo start
```

Then press `a`/`i`/`w` in the terminal (Android / iOS / web) or scan the QR
code with Expo Go on your phone.

If `npm install` or the Metro bundler surfaces errors, paste them back to me —
I can fix things from the error text without needing to run it myself.

## What's actually implemented

- **Instructor Profile screen** — bio, specialties, certifications, services,
  privates, testimonials, gallery, contact — all populated from real seed
  content (Michelle Scutti's 2017 Wild Rose Yoga site), styled with the
  "Classic Yoga" skin colors (maroon/teal). See `src/data/seedInstructor.ts`.
- **Schedule screen** — renders studio/time cards from seed data, with a link
  out to the external studio booking page and an empty state for "no public
  classes right now."
- **Sequence Builder screen** — drag-to-reorder pose list
  (`react-native-draggable-flatlist`), inline duration/side editing, a
  quote + Spotify playlist URL field, and a working PDF export button
  (`expo-print` + `expo-sharing`) that generates a printable sequence card.
- **Shared types** (`src/types/index.ts`) matching the data model sketched in
  the product ideation doc: `Pose`, `Sequence`, `SequenceItem`,
  `SequenceClassLink`, plus `Instructor`/`ScheduleEntry`/`ServiceModality`/etc.
  for the mini-site content.
- **Skin system stub** (`src/theme/skins.ts`) with one real skin,
  `classic-yoga`, carrying forward the 2017 site's palette as the first
  pre-built skin option, and a generic `default` skin.

## What's explicitly NOT implemented (next steps)

- No backend/API or database — everything is static seed data in
  `src/data/`. Swapping seed data for real API calls is the next big step.
- No auth, no student "follow" graph, no push notifications.
- No sequence-to-class linking UI (the `SequenceClassLink` type exists, but
  nothing in the UI creates or displays that relationship yet).
- No app icon/splash image (removed from `app.json` to avoid a missing-file
  build error) — add real branding assets when ready.
- Only 10 seed poses — the real pose library (40–60+) is a separate content
  workstream per the ideation doc.

## Where things live

```
App.tsx                        entry point
src/navigation/RootNavigator.tsx   bottom tab nav (Profile / Schedule / Sequences)
src/screens/                   the three screens above
src/data/                      seed content (instructor + poses)
src/theme/skins.ts             skin/color definitions
src/types/index.ts             shared TS types
assets/instructor-seed/        real photos/logo copied from the michelle-scutti repo
```
