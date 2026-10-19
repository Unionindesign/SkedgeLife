# Plan: your own accent color (#43)

Status: draft for review. One branch, one PR.

## Scope

#43 asks for logo upload and an accent color picker. **Logo upload already shipped** in the self-serve editing work (Website → Look), and both the app and the website show the logo. So this PR is the accent color, and it closes #43.

## What the user sees

Website → Look gets an **Accent color** section between Logo and Skin:

- **"Skin's color"** is the first choice and the default. It's what everyone has today.
- **A row of about 10 preset swatches,** for example teal, plum, terracotta, navy, forest, berry and slate. Every preset passes contrast checks.
- **A "Custom" hex field** (`#7a3e9d`). A color too light to read on white is refused with "Too light to read on white. Try a darker shade."
- **It saves right away,** like the logo and skin. The preview updates when you go back to it.

The color carries through everywhere the skin's accent is used today:
- section titles, links and "more…", tags and outlined buttons
- carousel dots
- the website footer (where the skin's footer uses its accent, as Classic Yoga's does)
- the light tint behind alternating sections
- the in-app buttons on the Schedule, Edit profile and Event screens

## How it works

**Database:** one migration.
- `profiles.accent_color text null`, with a `check (accent_color ~ '^#[0-9a-f]{6}$')` that stores lowercase only.
- The column is added to the `grant update (...)` list.
- Null means "use the skin's accent", so existing profiles don't change.

**`packages/skins`:**
- **`contrastRatio(a, b)`**: the WCAG formula.
- **`isReadableAccent(hex)`**: at least 4.5:1 against white. The accent appears both as text on white and as the background behind white text, and the ratio is the same both ways.
- **`ACCENT_PRESETS`**: the preset swatches.
- **`skinFor({ skin, accent_color })`**: the skin with the custom accent applied.
  - The accent changes.
  - The footer changes too, if the skin's footer *was* its accent.
  - The section tint (`band`) and the card background become light tints of the new accent. Otherwise, for example, Classic Yoga's teal cards would clash with a plum accent.
  - Header, text and fonts stay with the skin.
  - An invalid stored value is ignored, and the page falls back to the skin's accent.

**Callers:** every `getSkin(profile.skin)` that renders a profile becomes `skinFor(profile)`:
- in the app: `ProfilePage`, `WebsiteFooter`, `TestimonialsSection`, `ScheduleScreen`, `EditProfileScreen`, `EventFormScreen`
- on the website: `app/[handle]/page.tsx`

The website already re-renders within a minute of a change, so nothing else is needed there.

## Tests

- **Unit tests** (`packages/skins`):
  - contrast against the WCAG reference values
  - every preset is readable on white and on its own tint
  - `skinFor` with null, valid and invalid colors
  - the footer follows the accent only when it did before
  - every existing skin's accent is readable
- **pgTAP:**
  - a bad hex and uppercase hex are rejected
  - an owner can set and clear their own color
  - another user can't change it
- **In the browser** (local Supabase): pick a preset and a custom color, and refuse a light one (`#ffeb3b`). Check Michelle's page in the app preview and on the website at phone and laptop width. Rerun Lighthouse's contrast check.
- **On the phone:** the swatch row and hex keyboard on the Look screen.

## Decisions for you

1. **Free or paid?** **Recommendation: free.** It's basic branding, and a free page that looks like *theirs* is what gets shared. Paid perks stay the custom domain, no caps, and bookings. The general plan's "limited skin selection" for free can apply to skins (#41), not colors.
2. **Should tints follow the accent?** (The section tint and the cards, as above.) **Recommendation: yes.** Without it, only the titles change and the page clashes.

## Not in this PR

- A full color wheel. Presets plus hex covers it without a new dependency.
- Changing the header or text colors. That's what skins are for.
- Dark backgrounds.

## After merging

Run `npx supabase db push` for the new column.
