import { Arvo, Bitter, Caveat, Cormorant_Garamond, Great_Vibes, Oswald } from "next/font/google";

// The skins' font names (packages/skins) mapped to web fonts, matching the app.
// None are preloaded: a preload would make every page download every skin's
// fonts, while without one the browser fetches only the fonts the page's
// skin uses (display: swap shows the fallback meanwhile).
export const arvo = Arvo({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-arvo",
  display: "swap",
  preload: false,
});
export const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
  preload: false,
});
// One weight each, like the app; the browser uses it for bold and regular text
// alike. Next.js needs each font's options written out in full.
export const cormorantGaramond = Cormorant_Garamond({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  display: "swap",
  preload: false,
});
export const oswald = Oswald({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
  preload: false,
});
export const bitter = Bitter({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-bitter",
  display: "swap",
  preload: false,
});
export const caveat = Caveat({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

export const fontVariables = [arvo, greatVibes, cormorantGaramond, oswald, bitter, caveat]
  .map((font) => font.variable)
  .join(" ");

export { fontFamily } from "./fontFamilies";
