# TODO

Things that need a person, not code: accounts to create, decisions to make, conversations to have. Code work lives in [GitHub issues](https://github.com/Unionindesign/SkedgeLife/issues); this list links to them where one exists.

Statuses: **Open** (ready to do), **In progress**, **Waiting** (blocked on something else, noted), **Done** (keep for a while, then prune).

| Added | Status | To do | Links | Notes |
|---|---|---|---|---|
| 2026-09-26 | Done | Merge the catch-up PR that brings the monorepo and Supabase work to `main` | #84 | Merged 2026-09-26. |
| 2026-09-26 | Done | Finish phone preview setup: create a free Expo account, sign in to Expo Go and run `npx expo login` in WSL, then `npm start -- --tunnel` | | Expo Go now asks for login. Once signed in on both, the project appears under "Development servers" in Expo Go. Running in Expo Go 2026-10-03. |
| 2026-09-26 | Open | Try the app on the iPhone: drag poses in the Sequence Builder, and "Export sequence card (PDF)" | #76 | The two features the browser check can't cover. |
| 2026-09-26 | Done | Optional: `sudo apt install -y libnss3` so React Native DevTools (`j` in the Expo terminal) opens | | Installed 2026-09-26. |
| 2026-09-26 | Done | Hosted Supabase project: create it (`wiizhsznblwkiuzkchzw`), `npx supabase login`, `npx supabase link`, `npx supabase db push` | #82 | Done 2026-09-26; both migrations confirmed on the hosted database. Future migrations: `npx supabase db push` after merging. The hosted project starts with no profiles; the seed stays local. |
| 2026-09-26 | Done | Point the app at the hosted project: in `apps/mobile/.env`, set the hosted URL and the **publishable** key (Project Settings → API Keys) | | Then `npm start -- --tunnel`. Copy `.env.example` back over `.env` to return to local. Done 2026-10-03. |
| 2026-09-26 | Done | In the hosted Supabase dashboard (Authentication → Sign In / Providers → Email): turn **Confirm email** off for now, and set the minimum password length to **8** to match local | | Matches the 2026-09-26 sign-in decision. Without this, hosted sign-up asks users to confirm by email first. Confirm email off 2026-10-03; minimum password length was already 8.  |
| 2026-09-26 | Open | Once the hosted project is linked and pointed at from `apps/mobile/.env`: sign up in the app on your phone (you, and later Michelle) to create real profiles | #82 | Replaces copying seed data to hosted. |
| 2026-09-26 | Open | Before launch: set up a real email service (e.g. Resend) for Supabase auth emails, then turn **Confirm email** back on | | Supabase's built-in email on the free plan only sends a few messages per hour. Also a good time to add passwordless codes. |
| 2026-09-24 | Open | Provide a logo / brand art for the app icon and splash screen | #3 | Until then Expo uses its default icon. |
| 2026-09-24 | Open | Loop in your brother on the Stripe spike, including whether instructor payouts are in scope | #20 | Open question from the general plan. |
| 2026-09-24 | Open | Follow up with Michelle (or other instructors): should live classes be watch-only or interactive? | #57 | Blocks live-streaming vendor and cost scoping. |
| 2026-09-24 | Open | Decide: rates as "inquire only", or a structured price list? | #33 | |
| 2026-09-24 | Open | Decide: cap on marketing blasts per month? | #56 | |
| 2026-09-24 | Open | Market research: which professions beyond yoga want this? | #74 | Informs skins and profession-specific features. |
| 2026-09-26 | Open | Decide the inactive-handle reclaim policy (how long, how owners are warned) | | Open question in `docs/DECISIONS.md`. Needed before launch, not now. |
| 2026-09-26 | Open | Before launch: review the `npm audit` warnings | | Don't run `npm audit fix --force`; it downgrades Expo packages. |
| 2026-10-03 | Open | Review the scheduling plan and answer its open question: the platform fee | | `docs/plans/2026-10-03-scheduling-events-and-bookings.md`. Fee question goes with #20. |
| 2026-10-03 | Waiting | Create a Mapbox account and tokens (a public token for the app, a secret download token for builds) | | Needed at the start of the Discovery phase, not before. |
| 2026-10-03 | Waiting | Set up an EAS development build on the iPhone (replaces Expo Go once the app uses Mapbox) | | Discovery phase. Free EAS tier is enough. |
| 2026-10-03 | Open | Before launch: upgrade Supabase to Pro (or similar) so the hosted project stops pausing | | The free plan pauses after about a week of inactivity; restore it from the dashboard until then. |
| 2026-10-04 | Open | After merging the self-serve editing PR: `npx supabase db push` (photo storage bucket, gallery limits, length limits), then restart Expo with `--clear` and run the PR's phone checklist against the hosted project | | |
| 2026-10-16 | Open | After merging the Scheduling 1 PR: `npx supabase db push` (two migrations: events, occurrences, caps, the nightly job; then moving the old schedule over and dropping it), and reload the app | #90–#95 | Enables PostGIS and pg_cron from the migration. Check the nightly job exists: Database → Cron in the dashboard, or `select * from cron.job`. Free-text times without an "am/pm" time aren't moved and are listed as warnings in the push output. |
| 2026-10-18 | Open | After the CI PR merges: make CI a required check (GitHub → Settings → Branches → add a rule for `main` → "Require status checks to pass" → pick **Typecheck, lint, format, unit tests** and **Database tests**) | #88 | The check names appear once CI has run on a PR. |
| 2026-10-18 | Open | Optional: install `prek` and run `prek install` to get the pre-commit hooks | #88 | See `docs/dev/testing.md`. |
| 2026-10-18 | Open | Deployment PR prep: Vercel project for `apps/web`; hosted Supabase URL and publishable key in Vercel's environment variables; then the domains (`skedgelife.com`, and `michellescutti.com` moved from GitHub Pages to Vercel once you're happy with the site) | #80 | Steps from chat 2026-10-18 go into the deployment PR's plan; the custom-domain lookup uses Next.js 16's `proxy.ts` (formerly middleware). Hobby (free) is non-commercial only: move to Pro before charging anyone. |
| 2026-10-18 | Open | After merging the accent color PR: `npx supabase db push` (adds `profiles.accent_color`) | #43 | |
| 2026-10-04 | Open | When the website has an address: add it to the hosted dashboard (Authentication → URL Configuration: site URL and redirect URLs) | #19 | See `docs/dev/auth.md`. |
| 2026-10-04 | Open | Later: a cleanup job for orphaned photo files (uploads whose delete failed) | | Small storage cost only; not urgent. |
