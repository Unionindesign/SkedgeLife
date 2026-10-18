import type { OccurrenceWithEvent, ProfilePage } from "@skedgelife/data";
import { dateDetails } from "@skedgelife/data";
import { safeUrl } from "./urls";

// schema.org data for search engines: the person, and their upcoming one-off
// events. Weekly classes are left out for now (schema.org's repeating events
// are poorly supported).
export function structuredData(
  profile: ProfilePage,
  opts: { url: string; image: string | null; oneOffs: OccurrenceWithEvent[] },
) {
  const instagram = profile.instagram_handle?.replace(/^@/, "");
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.display_name,
    description: profile.bio_short ?? undefined,
    image: opts.image ?? undefined,
    url: opts.url,
    knowsAbout: profile.teaches && profile.specialties.length > 0 ? profile.specialties : undefined,
    sameAs: instagram ? [`https://instagram.com/${instagram}`] : undefined,
  };
  const events = opts.oneOffs.map((o) => {
    const d = dateDetails(o);
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: d.title,
      description: d.description ?? undefined,
      startDate: o.starts_at,
      endDate: o.ends_at,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode:
        d.format === "online"
          ? "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
      // A private home's address is never published; only its area.
      location:
        d.format === "online"
          ? { "@type": "VirtualLocation", url: safeUrl(d.online_url) ?? opts.url }
          : {
              "@type": "Place",
              name: d.is_private_home ? (d.area ?? "Private home") : (d.venue?.name ?? ""),
              address: d.is_private_home ? (d.area ?? undefined) : (d.venue?.address ?? undefined),
            },
      organizer: { "@type": "Person", name: profile.display_name, url: opts.url },
    };
  });
  return [person, ...events];
}

// JSON for a <script type="application/ld+json"> tag. Profile text is user
// input, so "<" is escaped: otherwise a bio containing "</script>" could end
// the tag and inject HTML.
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
