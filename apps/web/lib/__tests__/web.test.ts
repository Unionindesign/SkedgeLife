import { describe, expect, it } from "@jest/globals";
import type { OccurrenceWithEvent, ProfilePage } from "@skedgelife/data";
import { skins } from "@skedgelife/skins";
import { FAMILIES } from "../fontFamilies";
import { routeHandle } from "../handles";
import { pageSections } from "../sections";
import { jsonLd, structuredData } from "../structuredData";
import { safeUrl } from "../urls";

describe("routeHandle", () => {
  it("serves valid lowercase handles", () => {
    expect(routeHandle("michellescutti")).toEqual({ kind: "serve", handle: "michellescutti" });
  });
  it("redirects mixed case to lowercase", () => {
    expect(routeHandle("MichelleScutti")).toEqual({ kind: "redirect", handle: "michellescutti" });
  });
  it("404s anything that can't be a handle, without a database lookup", () => {
    expect(routeHandle("ab").kind).toBe("not-found");
    expect(routeHandle("has-dash").kind).toBe("not-found");
    expect(routeHandle("%3Cscript%3E").kind).toBe("not-found");
  });
});

describe("safeUrl", () => {
  it("allows http and https", () => {
    expect(safeUrl("https://rayoga.com/locations/Mission-Viejo/")).toBe("https://rayoga.com/locations/Mission-Viejo/");
  });
  it("refuses other schemes and junk", () => {
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("data:text/html,<b>hi</b>")).toBeNull();
    expect(safeUrl("not a url")).toBeNull();
    expect(safeUrl(null)).toBeNull();
  });
});

const profile = (overrides: Partial<ProfilePage> = {}) =>
  ({
    handle: "test",
    display_name: "Test </script><script>alert(1)</script>",
    bio_short: null,
    bio_long: "Hello",
    teaches: true,
    specialties: [],
    service_modalities: [{ id: "s" }],
    private_session_types: [],
    testimonials: [],
    gallery_images: [],
    contact_email: "a@b.co",
    contact_phone: null,
    instagram_handle: null,
    ...overrides,
  }) as unknown as ProfilePage;

describe("pageSections", () => {
  it("lists only sections with content, in page order", () => {
    expect(pageSections(profile(), { hasSchedule: true }).map((s) => s.id)).toEqual([
      "about",
      "offerings",
      "schedule",
      "contact",
    ]);
  });
  it("hides teaching sections for people who don't teach", () => {
    expect(pageSections(profile({ teaches: false }), { hasSchedule: false }).map((s) => s.id)).toEqual([
      "about",
      "contact",
    ]);
  });
});

describe("structured data", () => {
  it("never lets profile text close the script tag", () => {
    const html = jsonLd(structuredData(profile(), { url: "https://skedgelife.com/test", image: null, oneOffs: [] }));
    expect(html).not.toContain("</script>");
    expect(JSON.parse(html)[0].name).toBe("Test </script><script>alert(1)</script>");
  });

  it("publishes a private home's area, never its address", () => {
    const oneOff = {
      starts_at: "2026-10-21T17:00:00Z",
      ends_at: "2026-10-21T19:00:00Z",
      title: null,
      description: null,
      format: null,
      venue_id: null,
      venue: null,
      online_url: null,
      time_zone: null,
      capacity: null,
      booking_mode: null,
      booking_url: null,
      is_private_home: null,
      area: null,
      event: {
        title: "Workshop",
        format: "in_person",
        is_private_home: true,
        area: "Laguna Hills",
        time_zone: "America/Los_Angeles",
        venue: { name: "Home", address: "1 Secret St" },
      },
    } as unknown as OccurrenceWithEvent;
    const json = jsonLd(
      structuredData(profile(), { url: "https://skedgelife.com/test", image: null, oneOffs: [oneOff] }),
    );
    expect(json).toContain("Laguna Hills");
    expect(json).not.toContain("Secret");
  });
});

describe("fonts", () => {
  it("has a web font for every skin font", () => {
    for (const skin of Object.values(skins)) {
      for (const font of Object.values(skin.fonts))
        if (font) expect([font, FAMILIES[font]]).toEqual([font, expect.any(String)]);
    }
  });
});
