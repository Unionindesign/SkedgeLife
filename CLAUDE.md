# CLAUDE.md

Instructions for Claude Code (or any other AI assistant) working in this repo. Read this at the start of every session — the goal is to pick up work correctly without needing the full prior conversation.

## What this is

SkedgeLife is a mobile-first mini-site and scheduling app for independent instructors (yoga teachers to start), built as an npm workspaces monorepo: an Expo app, a Next.js public site (not yet built), a shared `packages/` layer, and a local-first Supabase backend. See [README.md](README.md) for the product, and [docs/](docs/) for the full plan.

## Where things live

Check these before starting anything — most "is this decided yet / has this been done" questions are already answered here:

- **[GitHub issues & milestones](https://github.com/Unionindesign/SkedgeLife/issues)** — what to build, and in what order. Run `gh pr list` and `gh issue list` before starting new work.
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** — what's shipped, session by session. Add a short entry every session/commit.
- **[docs/DECISIONS.md](docs/DECISIONS.md)** — decisions made and why. Check here before treating an open question as unresolved.
- **[docs/TODO.md](docs/TODO.md)** — things that need the user: accounts, decisions, follow-ups. Keep it current; don't let it drift from what's actually done.
- **[docs/rules/](docs/rules/)** — detailed working rules, linked below. When something here starts needing more than a couple of sentences, move it into a rule file instead of letting this file grow.

## Start of a new session

1. `git status` and `git branch --show-current` — check for uncommitted work or an open feature branch before doing anything else.
2. `gh pr list` — if a PR is already open, that's the work in progress. Start something new on top of it only as a deliberate stack (see the pull request rules).
3. Skim the top of `docs/CHANGELOG.md` and the `Open`/`In progress` rows in `docs/TODO.md`.
4. Pick up the next issue, or ask the user which one.

## Working rules

- **[docs/rules/pull-requests.md](docs/rules/pull-requests.md)** — one feature branch per piece of work, stacking with care, never pushing feature work to `main`, and what to run before pushing.
- **[docs/rules/model-selection.md](docs/rules/model-selection.md)** — when to suggest the user switch models.
- **[docs/rules/time.md](docs/rules/time.md)** — UTC `timestamptz` for moments, an IANA zone on every event, ISO 8601 with `Z` on the wire, local display only at the edge.
- **[docs/rules/database.md](docs/rules/database.md)** — migrations, row-level security, where queries live, and leaving the hosted project to the user.
- **[docs/rules/code.md](docs/rules/code.md)** — patterns already used in the mobile app.
- **[docs/rules/milestones.md](docs/rules/milestones.md)** — the workflow: an uncommitted plan the user reviews, then on greenlight one feature branch and one PR with everything (plan, database, backend, frontend, docs).

## Security (non-negotiable)

- Never paste the Supabase DB password or secret key into chat, ever.
- Keys live only in untracked `.env` files — check `.gitignore` covers them before committing anything env-shaped.
- The app uses only the **publishable** Supabase key, never the secret key.
- Don't read `supabase/.env.local`. Don't connect the Supabase GitHub integration.
- `supabase/seed.sql` has a fake login with a known password — it must never reach the hosted project.
- Never run `npm audit fix --force` (it downgrades Expo packages).
- Any test run or build must point at the local Supabase instance, so test accounts never hit hosted.

## Attribution

Commit messages and PR descriptions end with the attribution lines given in the system reminder for the current session. They vary by which model is active — don't hardcode a specific model name.
