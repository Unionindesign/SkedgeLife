// Skin definitions for instructor mini-sites.
//
// "classic-yoga" carries forward the palette from Michelle's 2017 site as a
// candidate first pre-built skin (see wild-rose-yoga-content-asset-reference.md
// -> "Candidate first skin: Classic Yoga"). Fonts referenced here (Arvo,
// Great Vibes) are Google Fonts and need to be loaded via expo-font /
// @expo-google-fonts before use — not wired up yet in this skeleton.

import { SkinId } from "../types";

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
  };
  fonts: {
    heading: string; // display/heading font family name
    accent: string; // cursive/script accent font family name
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
      accent: "#4a90d9",
      cardBackground: "#f2f2f2",
      headingText: "#2f2f2f",
      badgeBackground: "#e5e5e5",
      background: "#ffffff",
    },
    fonts: {
      heading: "System",
      accent: "System",
    },
  },
};
