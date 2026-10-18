import type { ProfilePage } from "@skedgelife/data";

export type SectionLink = { id: string; label: string };

// The page's sections that have something in them, in page order, for the
// section nav (#42). Empty sections are hidden on the page, so they're left out here too.
export function pageSections(profile: ProfilePage, opts: { hasSchedule: boolean }): SectionLink[] {
  const teaches = profile.teaches;
  const candidates: [boolean, SectionLink][] = [
    [Boolean(profile.bio_long), { id: "about", label: "About" }],
    [
      teaches && profile.service_modalities.length + profile.private_session_types.length > 0,
      { id: "offerings", label: "Classes" },
    ],
    [opts.hasSchedule, { id: "schedule", label: "Schedule" }],
    [profile.testimonials.length > 0, { id: "testimonials", label: "Testimonials" }],
    [profile.gallery_images.length > 0, { id: "gallery", label: "Gallery" }],
    [
      Boolean(profile.contact_email || profile.contact_phone || profile.instagram_handle),
      { id: "contact", label: "Contact" },
    ],
  ];
  return candidates.filter(([show]) => show).map(([, link]) => link);
}
