# Pull requests and branching

Linked from [CLAUDE.md](../../CLAUDE.md).

## No stacked PRs

Branch each PR from `main`, and only after the previous PR has merged into `main`. Don't branch a new feature off another unmerged feature branch.

This is a hard lesson, not a style preference: PRs #81 and #83 were stacked and ended up merging into each other's branches instead of `main`, which needed a catch-up PR (#84) to untangle. One feature branch open at a time avoids it.

Practical effect: if a PR is open, that's the work in progress. Don't start the next slice on a new branch until it merges — pick up something else that doesn't touch code (docs, planning, GitHub triage) or wait.

`Closes #N` in a PR description only fires on merge into `main`. It does nothing on merge into another branch, which is one more reason stacking causes silent damage — issues quietly stay open.

## Never push feature work straight to `main`

All code changes go through a feature branch and a PR for review, no exceptions.

**Docs-only changes** (this file, `CLAUDE.md`, `docs/*`) may go straight to `main`, but only when the user explicitly says so for that specific change. Default to a PR even for docs unless told otherwise.

## Before opening or updating a PR

Run these locally first — don't rely on CI to catch what a minute of local checking would:

- `npm run typecheck` from the repo root (covers all workspaces).
- `npx expo-doctor` from `apps/mobile` when Expo config or dependencies changed.
- Lint, Prettier, and unit tests — **not set up yet in this repo.** Until they exist, this step is a gap, not a pass. When they're added, this line gets replaced with the actual commands (e.g. `npm run lint`, `npm test`) and they become required here.
- Manual verification appropriate to the change: native/web export, and a browser check against the **local** Supabase instance for anything touching data. Any test build's `.env` must point at local, never hosted — this is a hard security rule, not a convenience default.

## PR description

Include: what changed, how it was tested (which of the checks above, and what you verified manually), and which issues it closes. End with the attribution footer from the current session's system reminder.

## Commits

End commit messages with the `Co-Authored-By` line from the current session's system reminder — it names whichever model is active, and changes between sessions.
