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
});
