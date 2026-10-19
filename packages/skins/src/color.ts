// Color math for skins: contrast checks (WCAG 2) and tints.

const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string | null | undefined): value is string {
  return typeof value === "string" && HEX.test(value);
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

// https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 1 (no contrast) to 21 (black on white).
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// WCAG AA for normal text.
export const MIN_TEXT_CONTRAST = 4.5;

// `amount` of the way from the color to white: 0 is the color, 1 is white.
export function tint(hex: string, amount: number): string {
  const c = channels(hex);
  return toHex(c.map((v) => v + (255 - v) * amount) as [number, number, number]);
}

// Lowercase #rrggbb from what someone typed ("7A3E9D", "#7a3e9d "), or null.
export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#?/, "#").toLowerCase();
  return isHexColor(value) ? value : null;
}
