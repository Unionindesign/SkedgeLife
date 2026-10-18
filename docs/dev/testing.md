# Lint, formatting, and tests

Everything below runs from the repo root, and the same checks run in CI on every PR (`.github/workflows/ci.yml`).

| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript in every workspace (the app and each package) |
| `npm run lint` | ESLint: Expo's rules for `apps/mobile` and `packages/ui`, typescript-eslint for the other packages (`eslint.config.mjs`) |
| `npm run format` / `npm run format:check` | Prettier on code (TS, JS, JSON, YAML). Markdown is hand-formatted, since Prettier pads the long DECISIONS and TODO table rows |
| `npm test` | Jest in each workspace: `jest-expo` for the app, `ts-jest` for `packages/data` and `packages/skins` |
| `npm run test:db` | pgTAP tests in `supabase/tests/database/` against the **local** database (`npm run db:start` first) |

CI also runs a **secret scan** (gitleaks, over the whole history) with the rules in `.gitleaks.toml`. If it flags something that isn't a secret, such as Supabase's fixed local development key, add that exact value to the allowlist there; never allowlist whole files.

**Node:** CI uses the version in `.nvmrc` (22). The app needs at least 20.19.4 (`engines` in `package.json`).

## How CI is locked down

- Third-party actions are pinned to full commit SHAs, with the version in a comment. Dependabot (`.github/dependabot.yml`) proposes updates weekly and waits two weeks after a release.
- The workflow token is read-only, and checkout doesn't leave it in `.git/config`, where dependency install scripts could read it.
- No secrets are passed to CI. The database job runs a throwaway local Postgres and never sees the hosted project.
- Every job has a timeout. PR runs are cancelled by newer pushes, but runs on `main` always finish.
- When adding a step: pin any new action by SHA, keep `permissions` at the minimum, and don't add secrets unless a job truly needs one (deployment, later, gets its own workflow).

## Writing tests

- **Unit tests** sit next to the code in `__tests__/` folders, named `*.test.ts`. Start with logic that's easy to get wrong: time zones and daylight saving, date math, validation, merging. App tests import `describe`/`it`/`expect` from `@jest/globals`.
- **Database tests** are SQL files using [pgTAP](https://pgtap.org/). Each runs in a transaction that rolls back, so fixtures never stick. Write dates relative to `now()` (generation only covers 12 weeks ahead), and act as a user with `set local role authenticated` plus `request.jwt.claims` to test access rules.
- In CI the database job starts a throwaway local Postgres with every migration and the seed. Tests never touch the hosted project.

## Lint warnings to clear

Expo's config includes React Compiler checks. Two of them, `set-state-in-effect` and `preserve-manual-memoization`, are warnings for now. They flag deliberate patterns: the local copies of lists for drag-to-reorder (`ContentListScreen`, `GalleryScreen`), loading state set when a fetch starts (`ProfileProvider`, `SignUpScreen`), and the calendar's memoized day list. Rework those screens and switch the rules back to errors.

## Pre-commit hooks (optional)

`.pre-commit-config.yaml` runs Prettier and ESLint on staged files (using the versions in `node_modules`, so run `npm ci` first) and `gitleaks` to catch secrets before they're committed. The gitleaks hook is frozen to a commit, since tags can be moved; update it with `prek autoupdate --freeze`. It uses [prek](https://github.com/j178/prek), a fast reimplementation of `pre-commit` that reads the same file. To opt in:

```bash
# one of: uv tool install prek  |  pipx install prek  |  brew install prek
prek install          # adds the git hook to this clone
prek run --all-files  # optional: try it on everything once
```

Nothing requires the hook. CI runs the full checks either way.
