# The website (`apps/web`)

This Next.js version has breaking changes from older ones. Check its bundled docs (`node_modules/next/dist/docs/`) before using an API; `apps/web/AGENTS.md`, which `next dev` writes, says the same. For example, middleware is now called `proxy` (`proxy.ts`).

Next.js (App Router) serving every profile's public website at `/<handle>`, server-rendered and cached. Plan: `docs/plans/2026-10-18-public-web-pages.md`.

## Running it

```bash
npm run db:start                               # local Supabase, with the seed
cp apps/web/.env.example apps/web/.env.local   # local values; never hosted ones
npm run dev:web                                # http://localhost:3000/michellescutti
```

`npm run build:web` makes a production build (CI runs it too). `npm run start -w @skedgelife/web` serves the build, which is the way to check caching or run Lighthouse.

On WSL, run Lighthouse with `TEMP=/tmp TMP=/tmp` in front. Otherwise it inherits the Windows temp path and creates a Chrome profile folder named `C:\Users\...\lighthouse.XXXX` in the current directory (ignored by `.gitignore`, but it shouldn't be made at all).

## How a page is served

- `app/[handle]/page.tsx` renders a profile on its first visit, caches it, and re-renders it in the background at most once a minute (`revalidate = 60` with an empty `generateStaticParams`). Edits show up within a minute; nothing is rebuilt or redeployed. Response headers show `x-nextjs-cache: MISS` then `HIT`.
- That's Next.js 16's "previous" caching model (`revalidate` plus `generateStaticParams`): fully supported, but it would be replaced by `"use cache"` if Cache Components (`cacheComponents` in `next.config.ts`) is ever turned on.
- Handles are checked before any query (`lib/handles.ts`): mixed case redirects to lowercase, and anything that can't be a handle gets the 404 page. Reserved words never belong to a profile, so they 404 too.
- Data comes from `packages/data` with the **publishable** key and no session (`lib/supabase.ts`). The page only sees what row-level security makes public; a private home's address never reaches it.

## Building pages

- **Components** are web components built for the web: semantic HTML and CSS modules, server components by default. The interactive ones come from `@skedgelife/ui/web` (`ParallaxSection`, `Carousel`, `TabsOrAccordion`, `ExpandableText`) with the same names and props as the app's `@skedgelife/ui`, sharing their logic through `packages/ui/src/shared`. A client component can't receive functions from a server component, so anything taking a render function (like `Carousel`) goes inside a small client wrapper (`components/Testimonials.tsx`).
- **Colors and fonts** come from the profile's skin (`packages/skins`). The skin's font names map to `next/font` families in `lib/fonts.ts`.
- **User data in links or scripts:** links from user data go through `safeUrl` (http and https only), and the JSON-LD block goes through `jsonLd`, which escapes `<` so profile text can't close the `<script>` tag. Keep both.
- **Times** follow `docs/rules/time.md`: in-person classes in their venue's zone, with the zone named; online events switch to the visitor's zone in the browser (`components/LocalTime.tsx`).
- **Images** are plain `<img>` tags. Photos are resized when uploaded, and this stays clear of Vercel's image-optimization quota. The local seed's photos are copies in `public/instructor-seed/`.
