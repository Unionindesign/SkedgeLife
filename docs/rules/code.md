# Code conventions (mobile app)

Linked from [CLAUDE.md](../../CLAUDE.md). Match the code around you; these are the patterns already in place.

- TypeScript throughout; React function components; `StyleSheet.create` at the bottom of the file.
- Styling comes from the profile's skin (`getSkin(profile.skin)` from `@skedgelife/skins`). Don't hard-code colors a skin should own.
- Profile data comes from `useProfile()` (`ProfileProvider`). Screens handle its loading, error, and not-found states with `ProfileStatus`.
- Shared UI goes in `apps/mobile/src/components/`. Errors shown to users go through `errorMessage()` in `src/lib/errors.ts`.
- Empty optional text is saved as `null`, and empty profile sections are hidden.
- Keep editing flows short, in line with "minutes, not months" (see `docs/DECISIONS.md`). When in doubt, leave a field out and note it as a follow-up.
- Comments are sparse and explain *why*, not *what*.
