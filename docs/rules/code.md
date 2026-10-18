# Code conventions (mobile app)

Linked from [CLAUDE.md](../../CLAUDE.md). Match the code around you; these are the patterns already in place.

- TypeScript throughout; React function components; `StyleSheet.create` at the bottom of the file.
- Styling comes from the profile's skin (`getSkin(profile.skin)` from `@skedgelife/skins`). Don't hard-code colors a skin should own.
- Profile data comes from `useProfile()` (`ProfileProvider`). Screens handle its loading, error, and not-found states with `ProfileStatus`.
- Shared UI goes in `apps/mobile/src/components/`. Building blocks shared with the website (and the future component library, #98) go in `packages/ui`: a React Native version (`@skedgelife/ui`), a web version with the same name and props (`@skedgelife/ui/web`), and any logic they share in `packages/ui/src/shared`. The website itself is covered in [docs/dev/web.md](../dev/web.md). A parallax background behind any screen is `<ParallaxScrollView backdrop={image}>`; a band with its own moving background is `<ParallaxSection image={image}>` inside one. To keep long pages short, use `ExpandableText` for long text and `TabsOrAccordion` for lists of titled items (tabs from 768 px wide, accordions below). Errors shown to users go through `errorMessage()` in `src/lib/errors.ts`.
- Empty optional text is saved as `null`, and empty profile sections are hidden.
- Keep editing flows short, in line with "minutes, not months" (see `docs/DECISIONS.md`). When in doubt, leave a field out and note it as a follow-up.
- Comments are sparse and explain *why*, not *what*.
