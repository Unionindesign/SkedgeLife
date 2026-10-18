// Skin definitions for instructor mini-sites.
//
// "classic-yoga" carries forward the palette from Michelle's 2017 site as a
// candidate first pre-built skin (see docs/reference/WILD-R~1.MD
// -> "Candidate first skin: Classic Yoga"). Font names here must match the
// keys passed to useFonts() in apps/mobile/App.tsx.

import { SkinId } from "@skedgelife/types";

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
