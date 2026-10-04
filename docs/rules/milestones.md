# Larger tasks (a whole milestone)

Linked from [CLAUDE.md](../../CLAUDE.md). For when the user hands over a milestone, or several issues at once.

1. **Read first:** the milestone's issues, the relevant plan in `docs/plans/`, `docs/DECISIONS.md`, and the rules that apply.
2. **Plan before code.** Post a short plan: issue order, PR boundaries, schema changes, and anything ambiguous or blocked on a decision. Wait for approval.
3. **Stop on real decisions.** If something only the user can decide comes up (pricing, product scope, privacy, vendors), ask rather than guess. Small, easily reversed choices can be made and noted in the PR.
4. **One PR at a time, each from `main`** (see [pull-requests.md](pull-requests.md)). Each PR carries its own docs updates (changelog, decisions, TODO, README) and a test plan.
5. **An "on the phone" checklist in every PR** for what the browser check can't cover (gestures, native pickers, PDF and printing, maps), so review is a few minutes of tapping through.
6. **Finish with a summary:** PRs opened, issues closed, TODO rows added, and what the user needs to check.
