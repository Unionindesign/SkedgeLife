# Model selection

Linked from [CLAUDE.md](../../CLAUDE.md).

Different tasks in this repo suit different Claude models. Since the user pays per-plan usage (not per-token), matching the model to the task keeps sessions cheaper and longer-running ones from burning through the allowance.

## When to suggest switching to a lighter model (e.g. Sonnet)

If the user starts a session or gives a task that's light or documentation-heavy while a heavier model (e.g. Opus) is active, say so once, briefly, near the start of the reply — don't repeat the suggestion every message. Examples of "light" work:

- Writing or updating docs (`docs/*`, `README.md`, `CLAUDE.md`).
- Creating or triaging GitHub issues, labels, or milestones.
- Updating `docs/CHANGELOG.md`, `docs/DECISIONS.md`, or `docs/TODO.md`.
- Simple, mechanical content or copy edits.

## When to suggest switching to a heavier model (e.g. Opus)

Suggest moving up if the task ahead involves:

- Architecture or design decisions with real tradeoffs.
- Database migrations, row-level security policies, or anything security-sensitive.
- Debugging tricky platform issues (Expo/React Native upgrades, WSL environment quirks).
- Anything where getting it wrong is expensive to unwind (e.g. a hosted-database change).

## How to suggest it

State it plainly and let the user decide — never switch models unilaterally. Something like: "This looks like a docs task — want to switch to Sonnet with `/model sonnet` before we continue?" Then proceed with the task either way; don't block on an answer.
