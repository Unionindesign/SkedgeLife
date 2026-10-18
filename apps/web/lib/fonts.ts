import { Arvo, Great_Vibes } from "next/font/google";

// The skins' font names (packages/skins) mapped to web fonts, matching the app.
export const arvo = Arvo({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-arvo", display: "swap" });
export const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

const FAMILIES: Record<string, string> = {
  Arvo: "var(--font-arvo), Georgia, serif",
  GreatVibes: "var(--font-great-vibes), cursive",
};

export function fontFamily(skinFont: string | undefined): string | undefined {
  return skinFont ? FAMILIES[skinFont] : undefined;
}
