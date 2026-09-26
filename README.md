# SkedgeLife

SkedgeLife gives independent instructors (yoga teachers to start, and later trainers, massage therapists, tutors and others) a simple, good-looking mini-site they can set up from their phone in minutes, not months. Add a photo, write a short bio, post your schedule, and you're live.

Students follow the instructors they like and get notified when something changes. There's no feed and no endless scrolling, just the people you chose to follow.

Instructors pick a **skin**, a pre-built color and font pairing, so their page feels like their own brand without any design work. The first skin, *Classic Yoga*, is based on a real instructor's site.

## What works today

The mobile app (Expo + React Native) has three tabs, all running on seed data from a real instructor profile. There's no backend yet.

- **Profile**: the instructor's mini-site. Bio, specialties, certifications, services, private sessions, testimonials, photo gallery, and contact links, styled with the Classic Yoga skin.
- **Schedule**: class times grouped by studio, with links out to each studio's booking page.
- **Sequence Builder**: plan a class by dragging poses into order, setting durations and sides, and adding a quote and playlist link. Export the result as a printable PDF card.

## In the works

Work is tracked as [GitHub milestones](https://github.com/Unionindesign/SkedgeLife/milestones) and [issues](https://github.com/Unionindesign/SkedgeLife/issues). Roughly in order:

- **Accounts and a real backend**, so instructors can edit their own page from their phone.
- **Public web pages** at `skedgelife.com/<handle>`, so anyone's page is shareable and searchable without the app.
- **Follow and notifications**: follow the people you like and hear about schedule changes.
- **A free page for everyone**: one photo, a short bio, interests, and simple small-group events. Teaching features turn on when you need them.
- **A paid plan** (via Stripe), open to anyone: a hosted website with your own domain, full photo gallery, payments, and marketing blasts to followers.
- **Video**: free and premium video libraries, video series, and eventually live-streamed classes.
- **More skins**, informed by research into which professions want this.

The thinking behind all of this lives in [`docs/`](docs/) (see below).

## Getting started

You'll need Node 20+ and npm. Development happens in WSL2 on Windows; see [`docs/dev/wsl.md`](docs/dev/wsl.md) for the quirks.

```bash
git clone git@github.com:Unionindesign/SkedgeLife.git
cd SkedgeLife
npm install
npm run typecheck
```

### Run it on your phone

1. Install **Expo Go** from the App Store or Play Store.
2. Start the dev server from the repo root:
   ```bash
   npm start -- --tunnel
   ```
   (`--tunnel` is needed on WSL2; the WSL notes explain why.)
3. Scan the QR code: on iPhone with the Camera app, on Android from inside Expo Go.

Saved changes reload on the phone automatically. Shake the phone to open the developer menu. No Mac or Xcode needed.

### Run it in a browser

```bash
npm run web
```

## Project layout

An npm workspaces monorepo. Run `npm install` once at the root.

```
apps/
  mobile/              Expo app (entry: index.ts -> App.tsx)
    src/navigation/    bottom tabs: Profile / Schedule / Sequence Builder
    src/screens/       the three screens
    src/data/          seed content (instructor profile, poses)
    assets/            seed photos and logo
  web/                 Next.js public pages (placeholder until the web phase)
packages/
  types/               shared data types (@skedgelife/types)
  skins/               skin colors and fonts (@skedgelife/skins)
docs/                  plans, decisions, changelog, dev notes
```

Supabase config (`supabase/`) and the shared data client (`packages/data`) arrive with the backend work.

## Docs

- [`docs/plans/`](docs/plans/): plans of approach, one dated file per topic. Start with the general plan.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): decisions made so far, and why.
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md): what changed, session by session.
- [`docs/reference/`](docs/reference/): user stories (epics) and the seed-content reference.
- [`docs/dev/`](docs/dev/): development environment notes.
