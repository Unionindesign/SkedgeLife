# SkedgeLife

SkedgeLife gives independent instructors (yoga teachers to start, and later trainers, massage therapists, tutors and others) a simple, good-looking mini-site they can set up from their phone in minutes, not months. Add a photo, write a short bio, post your schedule, and you're live.

Students follow the instructors they like and get notified when something changes. There's no feed and no endless scrolling, just the people you chose to follow.

Instructors pick a **skin**, a pre-built color and font pairing, so their page feels like their own brand without any design work. The first skin, *Classic Yoga*, is based on a real instructor's site; *Calm*, *Bold* and *Trail* suit other moods.

## What works today

The mobile app (Expo + React Native) runs on Supabase. Sign up with a name, handle, email, and password (or log in). The app has three tabs, and opens on Profile. Locally, a seeded account shows what a full instructor page looks like (see `docs/dev/supabase.md`).

- **Profile**: your profile in the app: photo, name, bios, interests, teaching details, and contact links. Tap **Edit profile** to change them; photos are compressed on the phone before upload.
- **Website**: manage your website's content.
  - **Look:** logo and skin.
  - **Services, Private sessions, Testimonials:** add, edit, delete, and drag to reorder. Testimonials show as a carousel, over a background photo with a parallax effect if you add one.
  - **Gallery:** 3 photos on the free plan, 30 on paid.
  - **Preview** shows the full page with your skin, as visitors will see it once public pages launch.
- **Schedule**: your classes and events as a **list** of upcoming dates, a **week**, or a **month** calendar (it remembers your choice), in real local time (in-person events in the venue's zone, online ones in yours). Tap **+** to add one: a title, a time (one time or weekly on chosen days), and a place or an online link. Tap a date to edit the event, cancel just that date, or cancel the whole thing. Studio classes keep their "Book" link to the studio's site. The free plan allows 3 weekly events and 1 larger group event a month. If you teach, the **Sequence Builder** opens from here: drag poses into order, set durations and sides, add a quote and playlist link, and export a printable PDF card.

**The website** (Next.js, `apps/web`): every profile's public site at `skedgelife.com/<handle>`, server-rendered from the same data. Header and logo, intro and bio, specialties, services and private sessions (tabs on wide screens, accordions on phones), a weekly timetable with what's coming up, parallax testimonials, a gallery, and a dark footer, in the profile's skin, with a section nav. Runs locally for now (`npm run dev:web`, see [`docs/dev/web.md`](docs/dev/web.md)); going online is the next step.

## In the works

Work is tracked as [GitHub milestones](https://github.com/Unionindesign/SkedgeLife/milestones) and [issues](https://github.com/Unionindesign/SkedgeLife/issues). Roughly in order:

- **Finding events**: a map, search by place, time, and interests (Mapbox), then RSVPs, paid bookings, and appointments.
- **The website online:** deploy to Vercel, `skedgelife.com`, and custom domains (Michelle's `michellescutti.com` first).
- **Follow and notifications**: follow the people you like and hear about schedule changes.
- **A free page for everyone**: one photo, a short bio, interests, and simple small-group events. Teaching features turn on when you need them.
- **A paid plan** (via Stripe), open to anyone: a hosted website with your own domain, full photo gallery, payments, and marketing blasts to followers.
- **Video**: free and premium video libraries, video series, and eventually live-streamed classes.
- **Profession-specific skins**, informed by research into which professions want this.

The thinking behind all of this lives in [`docs/`](docs/) (see below).

## Getting started

You'll need Node 20+, npm, and Docker (for the local database). Development happens in WSL2 on Windows; see [`docs/dev/wsl.md`](docs/dev/wsl.md) for the quirks.

```bash
git clone git@github.com:Unionindesign/SkedgeLife.git
cd SkedgeLife
npm install
cp apps/mobile/.env.example apps/mobile/.env   # points the app at the local database
npm run db:start                                # local Supabase with seed data
npm run typecheck
```

The app reads its data from Supabase. To use the hosted project instead of the local one (needed for the phone), see [`docs/dev/supabase.md`](docs/dev/supabase.md).

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
    src/navigation/    bottom tabs (Schedule / Profile / Website) and the screens they open
    src/screens/       Profile, Schedule, Event form, Edit profile, Sequence Builder, website preview
    src/screens/website/  Website tab and its editors (look, services, privates, testimonials, gallery)
    src/components/    shared UI: the profile page, form fields, photo picker, tag editor
    src/data/          profile loading (ProfileProvider) and seed poses
    src/lib/           Supabase client, image picking and upload, image lookup
    assets/            seed photos and logo
  web/                 Next.js website: public profile pages at /<handle> (see docs/dev/web.md)
packages/
  data/                shared Supabase queries, auth, and photo uploads (@skedgelife/data)
  types/               shared data types, incl. generated database types (@skedgelife/types)
  skins/               skin colors and fonts (@skedgelife/skins)
  ui/                  shared components: React Native (@skedgelife/ui) and web (@skedgelife/ui/web), same names and props
supabase/              local Supabase: config, SQL migrations, seed data
docs/                  plans, decisions, changelog, TODO, dev notes
```

The backend runs locally in Docker: `npm run db:start`. See [`docs/dev/supabase.md`](docs/dev/supabase.md).

Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run test:db`. CI runs them on every PR. See [`docs/dev/testing.md`](docs/dev/testing.md).

## Docs

- [`docs/plans/`](docs/plans/): plans of approach, one dated file per topic. Start with the general plan.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): decisions made so far, and why.
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md): what changed, session by session.
- [`docs/TODO.md`](docs/TODO.md): things that need a person: accounts, decisions, follow-ups.
- [`docs/reference/`](docs/reference/): user stories (epics) and the seed-content reference.
- [`docs/dev/`](docs/dev/): development environment notes.
