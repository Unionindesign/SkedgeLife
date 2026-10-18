# Public web pages (Next.js)

**Milestone:** "Foundation: Public Web Presence (NextJS SSR)": #15 (scaffold), #17 (handle routing), #68 (public page). **Not in this milestone:** #18 (browser page builder), #19 (signing in on the web), deployment and custom domains (a separate PR afterwards). **Related:** [2026-08-01-nextjs-ssr-web-architecture.md](2026-08-01-nextjs-ssr-web-architecture.md).

**Status:** approved 2026-10-18 (decisions below).

## Goal

Anyone can open `skedgelife.com/<handle>` in a browser, without the app, and see that person's website: fast, findable by search engines, good on a phone, and good on a laptop. Michelle's page, from local seed data, is the example to get right.

## Scope

| Issue | What gets built |
|---|---|
| #15 Scaffold | `apps/web`: Next.js (App Router, TypeScript) in the workspace, using `packages/data`, `packages/skins`, and `packages/types`. Supabase server client with the **publishable** key; public pages only read what row-level security already makes public. Lint, typecheck, unit tests, and a production build join CI. |
| #17 Handle routing | `/[handle]` serves the page; mixed case redirects to lowercase; unknown handles and reserved words get a 404 page. `/` is a simple SkedgeLife landing placeholder. |
| #68 Public page | The website, server-rendered (sections below), with the skin's colors and fonts, page titles and share previews (Open Graph), and structured data so search engines understand the person and their classes. |

**Sections**, in the order of Michelle's original site and the app's preview: header with logo → intro (photo, name, short bio) → bio (with "more…") → specialties and certifications → services and private sessions (tabs on wide screens, accordions on phones) → **weekly timetable** (see below) → testimonials (carousel over the parallax photo) → gallery (a grid; tap to enlarge) → dark footer (contact). Empty sections are hidden.

**Wide screens** (the "bigger screens" point from 2026-10-18): content capped at about 1100 px; on laptops, the intro sits beside the bio, and specialties beside certifications. A **sticky section nav** lists only the sections that have content (#42, folded in since it's small and belongs here).

**Out of scope:** editing on the web (#18), signing in (#19), deployment, Vercel, and custom domains (next PR), discovery and maps (Scheduling 2), and the AI builder (#97, #98).

**Weekly timetable:** weekly classes grouped by weekday, each with time (in the venue's zone, plus the zone name), title, place, and a "Book" link. Below it, "Coming up": one-off events and workshops in the next eight weeks, plus the next two weeks' changes to weekly classes (a cancelled or moved date, a substitute). Without those, the timetable would show a class that isn't happening this week.

## The main decision: how the website renders

The app's page is React Native. A website wants plain HTML: real headings, links, and text that search engines read, rendered on the server with little JavaScript. Two ways to get there:

1. **Reuse the React Native components on the web through react-native-web.** This gives the most reuse: `ProfilePage`, `ParallaxSection`, `Carousel`, and the tabs work as they are. But the HTML comes out as nested `<div>`s with generated styles, more JavaScript ships to visitors, and getting react-native-web's styles to render on the server inside the Next.js App Router is fiddly.
2. **Web components built for the web, sharing everything that isn't drawing.** `apps/web` gets its own small components in semantic HTML and CSS. They share the data (`packages/data`: queries, `dateDetails`, time helpers), the skins, and the logic (where a bio splits, how far parallax moves). The interactive pieces keep **the same names and props on both platforms**: `@skedgelife/ui` (React Native) and `@skedgelife/ui/web` (DOM: `ParallaxSection`, `Carousel`, `TabsOrAccordion`, `ExpandableText`). A screen written against one reads the same against the other.

**Recommendation: option 2.** The website exists to be found and to load fast for someone who doesn't have the app. That's exactly where react-native-web is weakest. It also matches the 2026-09-26 decision ("skin definitions are shared, skin rendering is not"). It means revisiting what I wrote on 2026-10-17 ("reused through react-native-web"): the components are still shared as an API and as logic, just not as one implementation. The cost is writing each interactive piece twice. That's about four small components now, and the component library (#98) would define each component once, with a native and a web version.

## Technical notes

- **Data:** server components call `getProfilePage(supabase, { handle })` and a public version of the upcoming dates (`upcoming_occurrences`, already filtered to public events). Pages refresh at most every 60 seconds (incremental static regeneration), so a viral link doesn't hammer the database and edits show up within a minute.
- **Times:** schedule times follow `docs/rules/time.md`. In-person classes show in the venue's zone with its name (for example "9:00 AM PT"), since the server can't know the visitor's zone. Online events show in the visitor's zone, filled in by a few lines of script after the page loads.
- **Images:** `next/image` for Supabase storage URLs. The seed's bundled photos (`instructor-seed/...`) get copied into `apps/web/public/` so the local seed shows up on the web too.
- **Fonts:** `next/font` for Arvo and Great Vibes, matching the app.
- **Parallax on the web:** a CSS transform driven by scroll (not `background-attachment: fixed`, which iPhones ignore), and nothing moves with "reduce motion" on, the same as the app.
- **Private homes:** the page never shows a private venue's address. Row-level security already hides it; the page shows the area instead.
- **Environment:** `apps/web/.env.local` points at **local** Supabase for development (an `.env.example` is committed, real `.env` files are not). Hosted values only go in Vercel, in the deployment PR.

## Testing

- **Unit tests** (Jest) for the web-only helpers: the section list for the nav, structured data, and handle normalization.
- **Production build in CI** (`next build`), plus lint and typecheck for `apps/web`.
- **Browser walk-through** against **local** Supabase: Michelle's page at phone width and laptop width, both skins, a 404, a mixed-case redirect, and Lighthouse scores for performance, accessibility, and SEO, which I'll report in the PR.

## Decisions (2026-10-18)

1. **Web components** built for the web, sharing data, logic, and component names with the app (option 2).
2. **A weekly timetable** for the schedule, with one-off events and this fortnight's changes listed below it.
3. **"Made with SkedgeLife" shows on the free plan**; paid sites can remove it (when billing exists).

## After this, the deployment PR

Vercel project (root `apps/web`), hosted Supabase env vars, `skedgelife.com`, and pointing `michellescutti.com` at Michelle's page. That last part needs a host-to-handle lookup in Next.js middleware and is the start of custom domains (#80). Details are in the chat summary for 2026-10-18 and will go in that PR's plan.
