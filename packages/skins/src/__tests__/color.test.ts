import { ACCENT_PRESETS, contrastRatio, isReadableAccent, normalizeHex, skinFor, skins, tint } from "..";

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
    // The old Default accent, found by Lighthouse (docs/DECISIONS.md).
    expect(contrastRatio("#4a90d9", "#ffffff")).toBeCloseTo(3.3, 1);
    expect(contrastRatio("#2b6cb0", "#ffffff")).toBeCloseTo(5.4, 1);
  });

  it("is the same in both directions", () => {
    expect(contrastRatio("#00695c", "#ffffff")).toBe(contrastRatio("#ffffff", "#00695c"));
  });
});

describe("tint and normalizeHex", () => {
  it("moves toward white", () => {
    expect(tint("#000000", 0)).toBe("#000000");
    expect(tint("#000000", 1)).toBe("#ffffff");
    expect(tint("#000000", 0.5)).toBe("#808080");
  });

  it("accepts what people type and rejects the rest", () => {
    expect(normalizeHex("7A3E9D")).toBe("#7a3e9d");
    expect(normalizeHex(" #7a3e9d ")).toBe("#7a3e9d");
    expect(normalizeHex("#fff")).toBeNull();
    expect(normalizeHex("purple")).toBeNull();
  });
});

describe("accent colors", () => {
  it("offers only readable presets", () => {
    for (const preset of ACCENT_PRESETS)
      expect([preset.label, isReadableAccent(preset.hex)]).toEqual([preset.label, true]);
  });

  it("refuses colors too light to read", () => {
    expect(isReadableAccent("#ffeb3b")).toBe(false);
    expect(isReadableAccent("#4a90d9")).toBe(false);
    expect(isReadableAccent("not a color")).toBe(false);
  });
});

describe("skinFor", () => {
  it("uses the skin as is without a custom color", () => {
    expect(skinFor({ skin: "classic-yoga", accent_color: null })).toBe(skins["classic-yoga"]);
    expect(skinFor({ skin: "classic-yoga" })).toBe(skins["classic-yoga"]);
  });

  it("applies a custom accent, with matching tints", () => {
    const skin = skinFor({ skin: "default", accent_color: "#6a1b9a" });
    expect(skin.colors.accent).toBe("#6a1b9a");
    expect(skin.colors.band).toBe(tint("#6a1b9a", 0.95));
    expect(skin.colors.cardBackground).toBe(tint("#6a1b9a", 0.9));
    // Header and fonts stay with the skin.
    expect(skin.colors.header).toBe(skins.default.colors.header);
    expect(skin.fonts).toBe(skins.default.fonts);
  });

  it("moves the footer only when it was the skin's accent", () => {
    // Classic Yoga's footer is its accent; Default's is dark gray.
    expect(skinFor({ skin: "classic-yoga", accent_color: "#6a1b9a" }).colors.footer).toBe("#6a1b9a");
    expect(skinFor({ skin: "default", accent_color: "#6a1b9a" }).colors.footer).toBe(skins.default.colors.footer);
  });

  it("ignores a stored color it can't use", () => {
    expect(skinFor({ skin: "default", accent_color: "#ffeb3b" })).toBe(skins.default);
    expect(skinFor({ skin: "default", accent_color: "red" })).toBe(skins.default);
  });

  it("keeps every built-in skin's accent readable on white", () => {
    for (const skin of Object.values(skins))
      expect(contrastRatio(skin.colors.accent, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});
