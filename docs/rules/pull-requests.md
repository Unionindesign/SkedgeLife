# Pull requests and branching

Linked from [CLAUDE.md](../../CLAUDE.md).

## One feature branch per piece of work

Plans, docs, migrations, backend, and frontend for a feature or milestone all land on **one feature branch and one PR**, so the user reviews the whole thing once. The workflow is in [milestones.md](milestones.md). Split into more than one PR only when it's clearly better (for example, one part is needed sooner, or the PR would be too big to review), and say why.

## Stacked PRs are allowed, with care

Stacking (branching from an unmerged feature branch) is fine when it's the best option. Before #84, PRs #81 and #83 were stacked and merged into each other's branches instead of `main`, which took a catch-up PR to untangle. So:

- Say in each PR description what it's stacked on, and the merge order.
- When the lower PR merges, retarget the upper PR to `main` (`gh pr edit <n> --base main`) before it merges.
- `Closes #N` only fires on merge into `main`. A stacked PR that merges into another branch leaves its issues open; close them by hand if that happens.

## Never push feature work straight to `main`

All code changes go through a feature branch and a PR for review, no exceptions.

**Docs-only changes** (this file, `CLAUDE.md`, `docs/*`) may go straight to `main` when the user explicitly says so for that change. Plans don't need a PR at all; see [milestones.md](milestones.md).

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
