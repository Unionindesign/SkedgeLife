// Skin definitions for instructor mini-sites.
//
// "calm", "bold" and "trail" (#41) are designed by mood rather than
// profession, until market research (#74) says who to design for.
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
  calm: {
    id: "calm",
    label: "Calm",
    colors: {
      header: "#8a9a82",
      accent: "#4a6741",
      cardBackground: "#eef1ea",
      headingText: "#3f4a3c",
      badgeBackground: "#5b6656",
      background: "#ffffff",
      band: "#f7f5ef",
      footer: "#3a3f3a",
      footerText: "#ffffff",
    },
    fonts: {
      heading: "CormorantGaramond",
    },
  },
  bold: {
    id: "bold",
    label: "Bold",
    colors: {
      header: "#161616",
      accent: "#c8372d",
      cardBackground: "#f4f4f4",
      headingText: "#161616",
      badgeBackground: "#161616",
      background: "#ffffff",
      band: "#faf3f2",
      footer: "#161616",
      footerText: "#ffffff",
    },
    fonts: {
      heading: "Oswald",
    },
  },
  trail: {
    id: "trail",
    label: "Trail",
    colors: {
      header: "#2f4f3a",
      accent: "#a5482a",
      cardBackground: "#f3ebdf",
      headingText: "#2f4f3a",
      badgeBackground: "#5a4632",
      background: "#ffffff",
      band: "#f9f4ec",
      footer: "#2f4f3a",
      footerText: "#fdf8f0",
    },
    fonts: {
      heading: "Bitter",
      accent: "Caveat",
    },
  },
};

// Skins are stored as text in the database; unknown values fall back to the default.
export function getSkin(id: string | null | undefined): Skin {
  return (id && skins[id as SkinId]) || skins.default;
}
