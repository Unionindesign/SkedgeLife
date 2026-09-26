# TODO

Things that need a person, not code: accounts to create, decisions to make, conversations to have. Code work lives in [GitHub issues](https://github.com/Unionindesign/SkedgeLife/issues); this list links to them where one exists.

Statuses: **Open** (ready to do), **In progress**, **Waiting** (blocked on something else, noted), **Done** (keep for a while, then prune).

| Added | Status | To do | Links | Notes |
|---|---|---|---|---|
| 2026-09-26 | Open | Merge the catch-up PR that brings the monorepo and Supabase work to `main` | #79, #5, #6, #7 | #81 and #83 merged into their stacked base branches instead of `main`. |
| 2026-09-26 | In progress | Finish phone preview setup: create a free Expo account, sign in to Expo Go and run `npx expo login` in WSL, then `npm start -- --tunnel` | | Expo Go now asks for login. Once signed in on both, the project appears under "Development servers" in Expo Go. |
| 2026-09-26 | Open | Try the app on the iPhone: drag poses in the Sequence Builder, and "Export sequence card (PDF)" | #76 | The two features the browser check can't cover. |
| 2026-09-26 | Open | Optional: `sudo apt install -y libnss3` so React Native DevTools (`j` in the Expo terminal) opens | | Only needed for the debugger. See `docs/dev/wsl.md`. |
| 2026-09-26 | Waiting | Create the free hosted Supabase project (US West, save the DB password in a password manager). Don't connect the GitHub integration yet. | #82 | Waiting on the local backend work (#8, #10). We'll link it from the terminal. |
| 2026-09-24 | Open | Provide a logo / brand art for the app icon and splash screen | #3 | Until then Expo uses its default icon. |
| 2026-09-24 | Open | Loop in your brother on the Stripe spike, including whether instructor payouts are in scope | #20 | Open question from the general plan. |
| 2026-09-24 | Open | Follow up with Michelle (or other instructors): should live classes be watch-only or interactive? | #57 | Blocks live-streaming vendor and cost scoping. |
| 2026-09-24 | Open | Decide: rates as "inquire only", or a structured price list? | #33 | |
| 2026-09-24 | Open | Decide: cap on marketing blasts per month? | #56 | |
| 2026-09-24 | Open | Market research: which professions beyond yoga want this? | #74 | Informs skins and profession-specific features. |
| 2026-09-26 | Open | Decide the inactive-handle reclaim policy (how long, how owners are warned) | | Open question in `docs/DECISIONS.md`. Needed before launch, not now. |
| 2026-09-26 | Open | Before launch: review the `npm audit` warnings | | Don't run `npm audit fix --force`; it downgrades Expo packages. |
