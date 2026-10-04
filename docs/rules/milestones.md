# Planning and larger tasks

Linked from [CLAUDE.md](../../CLAUDE.md). How a feature or a whole milestone goes from idea to merged PR. The user hands over large, end-to-end tasks (planning, database, backend, frontend, docs) rather than small slices.

## 1. Plan (no PR)

- Read the milestone's issues, the related plan in `docs/plans/`, `docs/DECISIONS.md`, and the rules that apply.
- Write the plan as `docs/plans/<date>-<topic>.md`, **uncommitted**, and tell the user it's ready. It covers scope (issue by issue), what's out of scope, schema changes, screens, the test plan, and the decisions the user needs to make, each with a recommendation.
- The user reviews it in the editor or in chat. Revise until they approve. Plans are never reviewed as a PR.

## 2. Greenlight, then build on one branch

- Only after the user says go: create the feature branch from `main` (or stacked, per [pull-requests.md](pull-requests.md)), and commit the approved plan as its first commit.
- Build everything on that branch: migrations, `packages/data`, screens, and docs (changelog, decisions, TODO, README).
- Stop and ask if a decision comes up that only the user can make (pricing, product scope, privacy, vendors). Make small, easily reversed choices yourself and list them in the PR.
- If the work changes the plan, update the plan file on the branch so it matches what was built.

## 3. One PR

- Open one PR for the whole branch (more only when [pull-requests.md](pull-requests.md) says it's clearly better).
- The description lists what was built per issue, choices made along the way, and the test plan, including an **"on the phone" checklist** for what the browser can't cover (gestures, camera and photo pickers, PDF and printing, maps), so review is a few minutes of tapping through.
- Finish with a summary: the PR, the issues it closes, TODO rows added, and anything the user must do after merging (for example `npx supabase db push`).
