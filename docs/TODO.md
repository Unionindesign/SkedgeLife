# TODO

Things that need a person, not code: accounts to create, decisions to make, conversations to have. Code work lives in [GitHub issues](https://github.com/Unionindesign/SkedgeLife/issues); this list links to them where one exists.

Statuses: **Open** (ready to do), **In progress**, **Waiting** (blocked on something else, noted), **Done** (keep for a while, then prune).

| Added | Status | To do | Links | Notes |
|---|---|---|---|---|
| 2026-09-26 | Done | Merge the catch-up PR that brings the monorepo and Supabase work to `main` | #84 | Merged 2026-09-26. |
| 2026-09-26 | In progress | Finish phone preview setup: create a free Expo account, sign in to Expo Go and run `npx expo login` in WSL, then `npm start -- --tunnel` | | Expo Go now asks for login. Once signed in on both, the project appears under "Development servers" in Expo Go. |
| 2026-09-26 | Open | Try the app on the iPhone: drag poses in the Sequence Builder, and "Export sequence card (PDF)" | #76 | The two features the browser check can't cover. |
| 2026-09-26 | Done | Optional: `sudo apt install -y libnss3` so React Native DevTools (`j` in the Expo terminal) opens | | Installed 2026-09-26. |
| 2026-09-26 | Done | Hosted Supabase project: create it (`wiizhsznblwkiuzkchzw`), `npx supabase login`, `npx supabase link`, `npx supabase db push` | #82 | Done 2026-09-26; both migrations confirmed on the hosted database. Future migrations: `npx supabase db push` after merging. The hosted project starts with no profiles; the seed stays local. |
| 2026-09-26 | Open | Point the app at the hosted project: in `apps/mobile/.env`, set the hosted URL and the **publishable** key (Project Settings → API Keys) | | Then `npm start -- --tunnel`. Copy `.env.example` back over `.env` to return to local. |
| 2026-09-26 | Open | In the hosted Supabase dashboard (Authentication → Sign In / Providers → Email): turn **Confirm email** off for now, and set the minimum password length to **8** to match local | | Matches the 2026-09-26 sign-in decision. Without this, hosted sign-up asks users to confirm by email first. |
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
