# SkedgeLife — Public Web Presence (NextJS SSR) Architecture

Status: draft — architecture direction, several open questions now decided (see `docs/DECISIONS.md`)
Related: `docs/plans/2026-08-01-general-plan-of-approach.md` (Phase 3), `docs/reference/SKEDGE~1.MD` (Epic 6, "rebuilt fresh in NextJS"; Epics 8-11, video/live), `docs/reference/WILD-R~1.MD` ("NextJS SSR skin system"), `docs/plans/2026-08-22-video-content-and-live-streaming.md` (video/live plan and hosting research), `docs/DECISIONS.md` (decisions log)

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

- Domain is **skedgelife.com** (already owned — decided 2026-08-22, see `docs/DECISIONS.md`). Slug-based routes off this single domain (e.g. `skedgelife.com/i/<slug>`), rather than per-instructor subdomains, at least for v1 — subdomains add DNS/cert complexity for an early-stage product. Revisit if custom domains become a paid-tier feature later (see Monetization section of the general plan).
- **Decided 2026-08-22:** slugs are split by role — `/i/<slug>` for instructors, `/u/<slug>` for students — to keep tier/role obvious from the URL and avoid collisions. Paid instructors (and free instructors likely to convert to paid) get priority for handle reservation over students. The exact reservation/priority mechanism (e.g. what happens if a student claims a handle an instructor later wants) is still open — see `docs/DECISIONS.md`.

## The page builder (Feature 5)

The "simple page builder" for free-tier student *and* basic instructor pages is a form-driven CMS-style editor (fixed fields: photo, bio, contact, schedule — not a freeform drag-and-drop canvas), per the general plan's Feature 5 scope and the Product Philosophy section there.

**Decided 2026-08-23** (see `docs/DECISIONS.md`): editing is **mobile-first** — the Expo app is the primary surface, built for quick entry (add a photo, write a short bio, update the schedule) finishable in one sitting on a phone. A browser-based builder in the NextJS app still exists as a secondary surface, but stays equally lean.

This is a deliberate, opinionated stance, not a scope gap: the account owner's own freelance experience building yoga/massage/wellness-office sites found that clients steered toward Wix/Squarespace-style builders almost universally never finished setting them up and never launched — too many options, too much required content, people give up. SkedgeLife is explicitly not trying to compete with general-purpose website builders on flexibility; "up and running in minutes, not months" is the intended product bet. Whatever gets built here — mobile or web — should be measured against that bar, not against Wix/Squarespace feature parity.

## Video content (Epics 8-11)

Added 2026-08-22, following the video/live streaming feature set scoped in `docs/plans/2026-08-22-video-content-and-live-streaming.md`:

- **Video library content (free and premium) should be browsable and embeddable on the NextJS SSR site**, the same as bio/schedule/gallery content — free clips in particular benefit from being embeddable and shareable outside the app (social sharing, SEO, an instructor linking a video from Instagram). Premium clips can still render on the web behind a login/paywall gate; the page itself stays web-native either way. This uses whatever signed/tokenized playback URL mechanism the chosen video vendor (Mux, Cloudflare Stream, etc. — see the video plan doc) provides, so the SSR app never needs to proxy or store video itself.
- **Live streaming is a tentative app-only feature for v1**, not a web SSR concern — real-time playback and join/leave state fit the native app more naturally, at least for now. This is a soft lean, not a decision: if "join live" turns out to mean a simple watch-only broadcast (as opposed to two-way/interactive video), that's realistically embeddable on the web too — the same way Twitch/YouTube Live embeds work — so it's worth revisiting once that open question (see the video plan doc) is resolved.
- Net effect: video-library pages join mini-site and student free-tier pages as content this app needs to render; live-session pages are excluded from this app's scope for now.

## Auth across two apps

Sessions/tokens need to work across both apps if editing can happen from either — this depends on the Phase 1/Phase 2 backend & auth design in the general plan, not something to solve here. Flagging so backend auth design accounts for a web client from day one, not just the mobile app.

## Deployment

Separate deploy pipelines are the natural default: Vercel (or similar) for the NextJS SSR app, EAS/Expo for the mobile app. **Decided 2026-08-22:** monorepo, with shared `packages/` for types/skin tokens — avoids type-drift between the two apps' view of the shared data model, which is worth the setup cost given how central `src/types/index.ts` already is.

## Open questions

- Shared skin tokens vs. web-only skins (see above) — blocks how much of `src/theme/skins.ts` carries forward.
- Custom domains as a future paid-tier feature (ties into the Monetization section of the general plan) — not needed for v1 but worth keeping the routing design from precluding it later.
- Whether watch-only live streaming eventually belongs on the web too (see Video content section above) — currently scoped as app-only, deliberately left open.
- Handle-priority mechanism for the `/i/` vs `/u/` slug split — see `docs/DECISIONS.md`.

Resolved: monorepo vs. separate repos, the slug namespace split, and the page-builder's mobile-first scope — see `docs/DECISIONS.md`.
