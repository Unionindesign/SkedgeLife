# SkedgeLife (mobile app skeleton)

Expo SDK 57 + TypeScript React Native app.

## Setup (run in WSL2)

```bash
cd ~/Projects/SkedgeLife
npm install
npm run typecheck
```

## Previewing

**On your phone (Expo Go):**

1. Install Expo Go from the App Store or Play Store. It only runs projects on
   the latest Expo SDK, so keep this project current.
2. Run `npx expo start --tunnel`. The tunnel is needed because WSL2 sits
   behind its own network, so the phone can't reach it directly. On first
   run, accept the prompt to install `@expo/ngrok`.
3. Scan the QR code with the iPhone Camera app (or from inside Expo Go on
   Android). Saved changes reload on the phone. Shake it for the dev menu.

No Xcode or Mac is needed for Expo Go.

**In a browser:** `npx expo start --web`.

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
