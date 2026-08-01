# SkedgeLife — General Plan of Approach

Status: draft
Owner: TBD
Related: `docs/reference/SKEDGE~1.MD` (user stories / epics), `docs/reference/WILD-R~1.MD` (seed content reference), `src/types/index.ts` (data model), `docs/plans/2026-08-01-nextjs-ssr-web-architecture.md` (public web page architecture)

## Purpose

This is a working plan of approach, not a spec. It maps the app's feature areas, states what's built vs. stubbed vs. missing today, and lays out a rough phase order for closing the gaps. Individual features should get their own dated plan docs in this directory as they're scoped in detail (e.g. `2026-08-15-instructor-onboarding.md`) — this doc stays high-level and gets revisited as priorities shift.

## What SkedgeLife is

A mobile-first app that gives small-business instructors (yoga, fitness, and beyond) an inexpensive, customizable "mini-site" (a "skin") — think early-2000s-MySpace-style personalization over a consistent content structure — plus a student-facing follow/notify model with **no public feed or scrolling discovery**. Students find and follow specific instructors; they don't browse a timeline.

Current implementation is an Expo + TypeScript React Native skeleton (`expo ~51`, `react-native 0.74`) with three screens wired to static seed data and no backend.

## Feature areas

### 1. Instructor Profile / Mini-Site ("Skin") — Epics 1, 3, 4, 5, 6, 7
**State: UI built against seed data only.**
- Bio, specialties, certifications, services, privates, testimonials, gallery, and contact are all implemented in `InstructorProfileScreen.tsx`, populated from `src/data/seedInstructor.ts` (Michelle Scutti / Wild Rose Yoga content, used purely as realistic placeholder data).
- One real skin exists (`classic-yoga` in `src/theme/skins.ts`) plus a generic `default`; fonts referenced by `classic-yoga` (Arvo, Great Vibes) are not yet loaded.
- Not started: instructor-side authoring/editing UI for any of this content (bio, certs, testimonials, gallery, skin picker), image upload + auto-compression (Epic 5), rates/"inquire for pricing" vs. structured price list (open question in the epics doc), auto-generated nav from filled-in sections, collaboration/barter note (Epic 3).

### 2. Class Schedule — Epic 2
**State: Read-only UI built against seed data only.**
- `ScheduleScreen.tsx` renders studio/time cards, link-out to external booking pages, and an empty "privates only" state.
- Not started: instructor-side schedule editing, map view of teaching locations, "what's on tonight" surfacing, and the open question of studios where SkedgeLife *owns* the booking flow (vs. link-out only) — currently only link-out is modeled.

### 3. Sequence Builder
**State: Most fully built feature; still seed-data-backed.**
- `SequenceBuilderScreen.tsx` has drag-to-reorder pose list, inline duration/side editing, quote + Spotify playlist URL field, and a working PDF export (`expo-print` + `expo-sharing`).
- Types (`SequenceClassLink`) exist for linking a sequence to a booked class instance so following students can see "tonight's flow," but no UI creates or displays that link yet.
- Pose library is 10 seed poses (`seedPoses.ts`); real library target is 40-60+, a separate content workstream.
- Not started: persistence (sequences aren't saved anywhere durable), sequence-to-class linking UI, pose icon assets (`iconSvgUrl` is typed but unused).

### 4. Student-Facing Follow / Notify Model — Epic 7 (student side)
**State: Not started.**
- No student accounts, no follow graph, no push/email notifications. This is core to the product's "no feed" positioning and currently has zero implementation.

### 5. Student Free-Tier Mini-Sites & Page Builder
**State: Not started — new scope, not yet reflected in `docs/reference/SKEDGE~1.MD`.**
- Concept surfaced in planning conversation (2026-08-01), not yet an epic doc: students get a basic, free "MySpace-style" page of their own — one profile photo, a short bio, presumably basic contact — using the same skin system as instructors but a stripped-down field set.
- Needs a simple, form-driven page builder (field-by-field editing against a fixed layout, not a freeform drag-and-drop canvas) — reuses pieces of the `Instructor` content model (bio, photo, contact) but scoped down per the free-tier limits in the Monetization section below.
- Open design question: does this become its own `StudentProfile` type, or a permissions-limited view of `Instructor`? Worth resolving before Phase 1 locks in the backend schema, since retrofitting a second profile type later is more expensive than designing for it now.
- This should get its own epics-style doc (mirroring the format of `SKEDGE~1.MD`) before implementation — it's new scope, not yet broken into user stories.

### 6. Accounts, Auth, Backend/API
**State: Not started — everything today is static seed data in `src/data/`.**
- No database, no API layer, no auth for instructors or students. This blocks nearly every "as an instructor, I want to..." story from being real (right now they're all hardcoded).

### 7. Branding / App Assets
**State: Not started.**
- No app icon or splash image (intentionally removed from `app.json` to avoid a missing-file build error).

## Monetization — Free vs. Paid Tiers

Not yet spec'd; rough shape from the 2026-08-01 planning conversation, to be refined into its own doc once the business model firms up:

- **Free:** one profile photo, basic bio/contact, likely a limited skin selection (page builder from Feature 5).
- **Paid:** full photo gallery (Epic 5), payment processing for bookings, scheduling for large groups (workshops/retreats — beyond the current single-instructor `ScheduleEntry` model), and sending invites/blasts to followers (beyond the simple schedule-change notifications in Epic 7).
- Open question: does the free/paid split apply only to students (basic page vs. nothing), only to instructors (basic mini-site vs. full-featured), or both with different tier definitions per role? The bullets above read as one unified tier ladder, but that needs to be confirmed before pricing/paywall logic gets designed.
- Payment processing implies a provider integration (Stripe is the default assumption for a project this size, not yet decided) and a billing/subscription layer that doesn't exist anywhere in the current data model — this is its own workstream, not a checkbox inside another phase.

## Market Research — Target Professions

Open research item — **not yet done**. Yoga is the initial vertical only because that's what the seed content (`WILD-R~1.MD`) happens to be. Candidate professions to validate demand against before investing in profession-specific features:

- **Fitness:** personal trainers, group fitness instructors, dance instructors, martial arts instructors
- **Wellness:** massage therapists, reiki/energy workers, nutritionists, life/wellness coaches
- **Beauty:** hair stylists, estheticians, makeup artists, nail techs
- **Education:** music teachers/tutors, language tutors, driving instructors, test-prep tutors
- **Trades/services:** photographers, doulas, personal chefs

This list is a placeholder for scoping conversations, not the output of actual research. Before committing engineering effort to any profession-specific feature (custom fields, category-specific skins, etc.), validate with real interviews/competitor scan — don't treat this list as findings.

## Suggested phase order

The dependency shape is: **backend/auth unlocks everything else** (instructor editing, student follow/notify, persistence), so it's the natural next big step regardless of which feature gets polished first cosmetically. Market research (above) isn't a phase — it should run continuously alongside Phases 0-2 since it can reshape Feature 5 and profession-specific skin work before much gets built.

1. **Phase 0 — Stabilize the skeleton.** `npm install` + run in WSL2, load the `classic-yoga` fonts, add real app icon/splash, confirm typecheck passes. Low-risk, unblocks everything else being demoable.
2. **Phase 1 — Backend & data model.** Stand up the actual database/API described in `src/types/index.ts`'s comments (poses, sequences, sequence_items, sequence_class_link, instructor/schedule/service tables), plus the new `StudentProfile` question from Feature 5. Swap screens from static seed imports to API calls. This is the highest-leverage unblock.
3. **Phase 2 — Instructor auth + self-serve editing.** Instructor accounts, and editing UI for profile/bio/certs/services/testimonials/gallery/schedule/skin — turning the currently read-only screens into the actual authoring tool instructors need.
4. **Phase 3 — Public web presence (NextJS SSR).** Stand up the separate NextJS app for public-facing, crawlable mini-site pages (instructor sites + student free-tier pages) per `docs/plans/2026-08-01-nextjs-ssr-web-architecture.md`. Build the form-driven page builder for the student free tier here.
5. **Phase 4 — Skins.** Design and build a handful of additional skins beyond `classic-yoga`/`default` — ideally informed by the market research above rather than guessed, since a "skin" is largely a proxy for "does this feel right for my profession."
6. **Phase 5 — Media pipeline.** Image upload with auto-compression/resize for gallery and headshots (flagged as necessary in the seed content doc — originals ran 1-17MB); also gates the free-tier "one photo" limit.
7. **Phase 6 — Student accounts + follow/notify.** Student-side auth, follow graph, push/email notifications on schedule changes — the other half of Epic 7 and the app's core "no-feed" differentiator.
8. **Phase 7 — Monetization.** Payment provider integration, paid-tier gating (gallery, large-group scheduling, invites/blasts) per the Monetization section above — depends on Phases 1-3 existing to have something to gate.
9. **Phase 8 — Sequence-to-class linking.** Wire up `SequenceClassLink` end-to-end so followers can see "tonight's flow" tied to a real class instance.
10. **Phase 9 — Content & polish.** Expand pose library to 40-60+, add pose icon assets, structured pricing option if the "inquire only" open question resolves that way.

## Open questions carried from the epics doc

These need product decisions before the relevant phase can be scoped in detail — worth their own short plan doc when addressed:
- Do schedule cards need a distinct visual state for studios where SkedgeLife owns booking vs. link-out only?
- Bio/gallery length limits — use Michelle's ~230-word, 2-paragraph bio and 4-image gallery as a rough baseline, or go bigger?
- Does "inquire for pricing" stay the only option, or does SkedgeLife add structured price lists?

## Open questions from the 2026-08-01 planning conversation

- Is `StudentProfile` a distinct type from `Instructor`, or a limited view of the same one?
- Does the free/paid tier split apply to students only, instructors only, or both — and are the tier definitions the same for each role?
- Which payment provider, and does it also need to support instructor payouts (not just student→instructor charges)?

## How to use this directory

Each plan file is named `YYYY-MM-DD-short-topic.md`. This file is the standing overview; feature-specific plans should link back to it and to the relevant epic(s) in `docs/reference/SKEDGE~1.MD` rather than re-deriving context.
