// Skin definitions for instructor mini-sites.
//
// "classic-yoga" carries forward the palette from Michelle's 2017 site as a
// candidate first pre-built skin (see docs/reference/WILD-R~1.MD
// -> "Candidate first skin: Classic Yoga"). Font names here must match the
// keys passed to useFonts() in apps/mobile/App.tsx.

import { SkinId } from "@skedgelife/types";
import { contrastRatio, isHexColor, MIN_TEXT_CONTRAST, tint } from "./color";

export * from "./color";

export interface Skin {
  id: SkinId;
  label: string;
  colors: {
    header: string;
    accent: string;
    cardBackground: string;
    headingText: string;
    badgeBackground: string;
    background: string;
    // A light tint behind alternating page sections, so the page isn't all white.
    band: string;
    // The dark footer at the bottom of the website, picked from the skin's own colors.
    footer: string;
    footerText: string;
  };
  // Omit a font to use the platform system font.
  fonts: {
    heading?: string; // display/heading font family name
    accent?: string; // cursive/script accent font family name
  };
}

export const skins: Record<SkinId, Skin> = {
  "classic-yoga": {
    id: "classic-yoga",
    label: "Classic Yoga",
    colors: {
      header: "#7a484f",
      accent: "#00695c",
      cardBackground: "#b2dfdb",
      headingText: "#afafaf",
      badgeBackground: "#585858",
      background: "#ffffff",
      band: "#eef6f5",
      footer: "#00695c",
      footerText: "#ffffff",
    },
    fonts: {
      heading: "Arvo",
      accent: "GreatVibes",
    },
  },
  default: {
    id: "default",
    label: "Default",
    colors: {
      header: "#2f2f2f",
      // Dark enough for text on white (5.4:1, WCAG AA); the old #4a90d9 was 3.3:1.
      accent: "#2b6cb0",
      cardBackground: "#f2f2f2",
      headingText: "#2f2f2f",
      badgeBackground: "#e5e5e5",
      background: "#ffffff",
      band: "#f4f6f9",
      footer: "#2f2f2f",
      footerText: "#ffffff",
    },
    fonts: {},
  },
};

// Skins are stored as text in the database; unknown values fall back to the default.
export function getSkin(id: string | null | undefined): Skin {
  return (id && skins[id as SkinId]) || skins.default;
}

// Light tints of a custom accent: behind alternating sections, and behind cards.
const BAND_TINT = 0.95;
const CARD_TINT = 0.9;

// A custom accent must read as text on white and on its own tints.
export function isReadableAccent(hex: string): boolean {
  if (!isHexColor(hex)) return false;
  return ["#ffffff", tint(hex, BAND_TINT), tint(hex, CARD_TINT)].every(
    (bg) => contrastRatio(hex, bg) >= MIN_TEXT_CONTRAST,
  );
}

// Swatches on the Look screen; all pass isReadableAccent.
export const ACCENT_PRESETS: { label: string; hex: string }[] = [
  { label: "Teal", hex: "#00695c" },
  { label: "Ocean", hex: "#245a94" },
  { label: "Navy", hex: "#1e3a8a" },
  { label: "Plum", hex: "#6a1b9a" },
  { label: "Violet", hex: "#5b4b8a" },
  { label: "Berry", hex: "#9d174d" },
  { label: "Rose", hex: "#ad1457" },
  { label: "Terracotta", hex: "#9c3a1a" },
  { label: "Forest", hex: "#256b29" },
  { label: "Ochre", hex: "#7a5000" },
  { label: "Slate", hex: "#455a64" },
];

// The skin a profile renders with: its skin, plus its own accent color (#43)
// if it picked one. The footer follows the accent when the skin's footer was
// its accent, and the section and card tints follow it so they don't clash.
// Header, text colors and fonts stay with the skin. A stored color that isn't
// readable is ignored.
export function skinFor(profile: { skin: string | null; accent_color?: string | null }): Skin {
  const skin = getSkin(profile.skin);
  const accent = profile.accent_color;
  if (!accent || !isReadableAccent(accent)) return skin;
  const { colors } = skin;
  return {
    ...skin,
    colors: {
      ...colors,
      accent,
      band: tint(accent, BAND_TINT),
      cardBackground: tint(accent, CARD_TINT),
      footer: colors.footer === colors.accent ? accent : colors.footer,
    },
  };
}
