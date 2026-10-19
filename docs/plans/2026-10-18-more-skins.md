# Plan: three new skins (#41)

Status: draft for review. One branch, one PR, separate from the accent color (#43).

## The research caveat

#41 says new skins should come from market research (#74), not guesses. That research hasn't happened. This PR designs skins by **mood**, not by profession, so none of them bakes in a guess about who the customers are. Each one should suit several kinds of teachers. Profession-specific skins can still come out of #74 later.

## The skins

Each skin has a full palette (`header`, `accent`, `cardBackground`, `headingText`, `badgeBackground`, `background`, `band`, `footer`, `footerText`), a heading font and an optional accent font. All are on a white background, like today's.

| Skin | Feel | Colors | Fonts | Suits |
|---|---|---|---|---|
| **Calm** | soft, quiet | sage header, deep sage accent, warm off-white bands, charcoal footer | Cormorant Garamond headings (elegant serif), no script | meditation, massage, restorative yoga, coaching |
| **Bold** | energetic, high contrast | near-black header, coral-red accent, black footer | Oswald headings (condensed sans), no script | fitness, pilates, dance, climbing |
| **Trail** | warm, outdoorsy | forest-green header, terracotta accent, sand bands, forest footer | Bitter headings (sturdy slab), Caveat accent (handwritten) | hiking guides, surf, outdoor classes, kids' programs |

The exact hex values come out of building them. Each accent is checked for 4.5:1 contrast on white, on its band, and against its footer text. The fonts are all on Google Fonts, so both apps load them the same way as Arvo and Great Vibes.

## Changes

- **Database:** a migration widens the `profiles.skin` check to include `calm`, `bold` and `trail`.
- **`packages/types`:** `SkinId` adds the three skins.
- **`packages/skins`:** the three definitions.
- **App:**
  - Fonts: `@expo-google-fonts/{cormorant-garamond,oswald,bitter,caveat}` (one weight each), loaded in `App.tsx`.
  - **Look screen:** each skin card becomes a small preview. It shows the header color, the name in the skin's heading font, an accent title, and a strip of the footer color, instead of three bare swatches. That way the fonts show before you choose.
- **Website:** the same fonts through `next/font` in `lib/fonts.ts`.
  - Only the skin a page uses is downloaded: `next/font` preloads per page and only fonts that are referenced get fetched.
  - I'll check this in the build output, so Lighthouse doesn't slip.

## Tests

- **Unit tests:**
  - every skin has every color in hex
  - every accent is readable on white and on its band
  - footer text is readable on the footer
  - every skin font has a matching web font in `lib/fonts.ts` (a new web test)
- **pgTAP:** the new skin ids are accepted, and an unknown one is refused.
- **In the browser:** Michelle's page in each skin, in the app preview and on the website, at phone and laptop width. Run Lighthouse on one new skin.
- **On the phone:** the Look screen previews show the right fonts.

## Decisions for you

1. **Names and moods:** Calm, Bold and Trail. **Recommendation:** go with these, and rename freely when you see them.
2. **Free or paid?** The general plan says free gets "a limited skin selection". **Recommendation:** all skins are free for now. Gating needs billing (#21/#22), and once it exists it's a one-line list. Revisit then.

## Order with #43

#43 (accent color) and this PR both touch the Look screen and `packages/skins`. I'll build #43 first and open it. Then I'll build this one from `main` and rebase it once #43 merges, so the two never stack.

## Not in this PR

- Dark-background skins. The pages have text colors fixed for light backgrounds; that's a separate pass.
- Profession-specific skins (after #74).

## After merging

Run `npx supabase db push` for the skin check.
