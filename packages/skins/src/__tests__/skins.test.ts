import { getSkin, skins } from "..";

describe("getSkin", () => {
  it("returns the skin asked for", () => {
    expect(getSkin("classic-yoga").label).toBe("Classic Yoga");
  });

  // Skins are stored as text, so the database can hold one the app doesn't know.
  it("falls back to the default for unknown or missing skins", () => {
    expect(getSkin("no-such-skin").id).toBe("default");
    expect(getSkin(null).id).toBe("default");
  });

  it("gives every skin all its colors", () => {
    for (const skin of Object.values(skins)) {
      for (const color of Object.values(skin.colors)) expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  // Accents are titles and links on white and on the section tint; footer text sits on the footer.
  it("keeps every skin readable (WCAG AA, 4.5:1)", () => {
    for (const { id, colors } of Object.values(skins)) {
      expect([id, "accent on white", contrast(colors.accent, colors.background) >= 4.5]).toEqual([
        id,
        "accent on white",
        true,
      ]);
      expect([id, "accent on band", contrast(colors.accent, colors.band) >= 4.5]).toEqual([id, "accent on band", true]);
      expect([id, "footer text", contrast(colors.footerText, colors.footer) >= 4.5]).toEqual([id, "footer text", true]);
    }
  });
});

// WCAG 2 contrast ratio.
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const s = parseInt(hex.slice(i, i + 2), 16) / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
