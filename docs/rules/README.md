# Rules

Binding conventions for SkedgeLife, linked from [CLAUDE.md](../../CLAUDE.md). Plans in `docs/plans/` describe what we intend to build; rules describe how everything must be built. When a rule changes, edit it here, and log it in `docs/DECISIONS.md` if it reverses an earlier decision.

When existing code breaks a rule, the rule lists it under "Known gaps", and an issue tracks the fix.

| Rule | Summary |
|---|---|
| [Pull requests](pull-requests.md) | Branch from `main`, no stacked PRs, checks to run before pushing. |
| [Model selection](model-selection.md) | When to suggest a lighter or heavier model. |
| [Time](time.md) | UTC `timestamptz` for moments, an IANA zone on every event, ISO 8601 on the wire, local display. |
| [Database](database.md) | Migrations, row-level security, queries in `packages/data`, hosted project left to the user. |
| [Code](code.md) | Patterns already used in the mobile app. |
| [Milestones](milestones.md) | Taking on a whole milestone: plan first, one PR at a time. |
