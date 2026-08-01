# SkedgeLife — Public Web Presence (NextJS SSR) Architecture

Status: draft — architecture direction, not yet decided in detail
Related: `docs/plans/2026-08-01-general-plan-of-approach.md` (Phase 3), `docs/reference/SKEDGE~1.MD` (Epic 6, "rebuilt fresh in NextJS"), `docs/reference/WILD-R~1.MD` ("NextJS SSR skin system")

## Why this needs its own doc

Both reference docs already gesture at a NextJS SSR skin system as the eventual home for mini-sites, but neither spells out how that coexists with the Expo/React Native app that's actually been built so far. This doc exists to think through that split before Phase 3 (public web presence) gets scoped in detail — it's an architecture direction, not a locked decision.

## The core split

- **Expo / React Native app (exists today):** the primary authoring and student-follow experience — instructors edit their content, build sequences, manage schedules; students browse and follow from their phone. Native app, not crawlable, requires install.
- **NextJS SSR app (not started):** the *public-facing* rendering of mini-sites — both full instructor sites and the new free-tier student pages (Feature 5 in the general plan). These need to be:
  - Crawlable/indexable (SEO matters for an instructor's "website" replacement)
  - Shareable via a plain URL without requiring the visitor to have the app installed
  - Fast on first load for an anonymous visitor (SSR beats client-rendered SPA here)

This mirrors what Epic 6 in `SKEDGE~1.MD` already implied ("rebuilt fresh in NextJS rather than ported from the old Materialize-based code") — this doc just makes the two-app shape explicit.

## Shared backend, not shared frontend

Both apps should consume the **same API** from Phase 1 of the general plan (the backend/data model phase). The data model in `src/types/index.ts` (`Instructor`, `ScheduleEntry`, `ServiceModality`, `Testimonial`, `GalleryImage`, plus the new `StudentProfile` question) is the shared contract both apps read from and, where editing lives in the web app too, write to.

What is *not* shared: actual rendering code. React Native views and NextJS/DOM components aren't portable 1:1. Two options, worth deciding before Phase 3 starts:
1. **Shared skin tokens only** — colors, fonts, spacing, section order live in a shared package (e.g. `packages/skins`); each platform has its own templates that consume those tokens. Skin *definitions* are shared, skin *rendering* is not.
2. **Web-only skins** — skins are a web-only concept (mini-sites are always viewed via the NextJS app, even by students using the native app to get there), and the RN app never renders a skin itself, just links out to the hosted page. Simpler, but means the app doesn't preview skins natively.

Leaning toward option 2 for v1 given how `skins.ts` is scoped today (color/font pairing, not full layout templates) — but flag this as the first thing to confirm before building the NextJS side, since it changes how much of `src/theme/skins.ts` is reusable vs. web-app-only.

## Routing & hosting

- Likely slug-based routes off a single domain (e.g. `skedge.life/<instructor-slug>`), rather than per-instructor subdomains, at least for v1 — subdomains add DNS/cert complexity for an early-stage product. Revisit if custom domains become a paid-tier feature later (see Monetization section of the general plan).
- Student free-tier pages (Feature 5) need their own slug namespace — decide whether students and instructors share one slug space or get separate prefixes (e.g. `/i/<slug>` vs `/u/<slug>`) to avoid collisions and make the tier obvious from the URL.

## The page builder (Feature 5)

The "simple page builder" for free-tier student pages is a form-driven CMS-style editor (fixed fields: one photo, bio, contact — not a freeform drag-and-drop canvas), per the general plan's Feature 5 scope. Open question: does this editing UI live in the NextJS app itself (edit-in-place on the web), in the Expo app (edit natively, render via SSR link), or both? Building it once in whichever app owns instructor editing (Phase 2 of the general plan) and reusing that pattern for students is the likely lower-effort path, but not yet decided.

## Auth across two apps

Sessions/tokens need to work across both apps if editing can happen from either — this depends on the Phase 1/Phase 2 backend & auth design in the general plan, not something to solve here. Flagging so backend auth design accounts for a web client from day one, not just the mobile app.

## Deployment

Separate deploy pipelines are the natural default: Vercel (or similar) for the NextJS SSR app, EAS/Expo for the mobile app. Not yet decided: monorepo (shared `packages/` for types/skin tokens) vs. fully separate repos. A monorepo avoids type-drift between the two apps' view of the shared data model, which is worth the setup cost given how central `src/types/index.ts` already is.

## Open questions

- Shared skin tokens vs. web-only skins (see above) — blocks how much of `src/theme/skins.ts` carries forward.
- Slug namespace for students vs. instructors.
- Where the page-builder editing UI actually lives (web, mobile, or both).
- Monorepo vs. separate repos for the NextJS app.
- Custom domains as a future paid-tier feature (ties into the Monetization section of the general plan) — not needed for v1 but worth keeping the routing design from precluding it later.
