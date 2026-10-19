// CSS font stacks for the skins' font names (packages/skins), using the
// variables set up in fonts.ts. Separate from fonts.ts so it can be tested
// without Next.js's font loader.
export const FAMILIES: Record<string, string> = {
  Arvo: "var(--font-arvo), Georgia, serif",
  GreatVibes: "var(--font-great-vibes), cursive",
  CormorantGaramond: "var(--font-cormorant-garamond), Georgia, serif",
  Oswald: "var(--font-oswald), Impact, sans-serif",
  Bitter: "var(--font-bitter), Georgia, serif",
  Caveat: "var(--font-caveat), cursive",
};

export function fontFamily(skinFont: string | undefined): string | undefined {
  return skinFont ? FAMILIES[skinFont] : undefined;
}
