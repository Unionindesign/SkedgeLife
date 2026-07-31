// Core data model types for SkedgeLife.
// Sequence/pose shapes follow the schema sketched in the product ideation doc:
//   poses (id, name_en, name_sanskrit, category, icon_svg_url, default_duration_sec)
//   sequences (id, instructor_id, title, quote text, playlist_url, created_at)
//   sequence_items (id, sequence_id, pose_id, order_index, duration_sec, side enum('L','R','N/A'), cue_note)
//   sequence_class_link (sequence_id, class_instance_id)
//
// These are UI-facing TypeScript shapes, not literal DB schemas — the real
// backend/DB design happens separately. Treat this as the contract the app's
// screens are built against for now.

export type Side = "L" | "R" | "N/A";

export interface Pose {
  id: string;
  nameEn: string;
  nameSanskrit?: string;
  category: string; // e.g. "standing", "seated", "backbend", "twist", "inversion"
  iconSvgUrl?: string;
  defaultDurationSec: number;
}

export interface Sequence {
  id: string;
  instructorId: string;
  title: string;
  quote?: string;
  playlistUrl?: string; // Spotify (or similar) embed link
  createdAt: string; // ISO date
  items: SequenceItem[];
}

export interface SequenceItem {
  id: string;
  sequenceId: string;
  poseId: string;
  orderIndex: number;
  durationSec: number;
  side: Side;
  cueNote?: string;
}

// Ties a sequence to an actual booked class instance, so students following
// that instructor can see "here's tonight's flow" / look back at past classes.
export interface SequenceClassLink {
  sequenceId: string;
  classInstanceId: string;
}

// --- Instructor mini-site content (see SkedgeLife user stories doc, Epics 1-7) ---

export interface Instructor {
  id: string;
  displayName: string;
  bioShort?: string;
  bioLong: string;
  certifications: string[];
  specialties: string[];
  logoUrl?: string;
  headshotUrl?: string;
  contact: {
    email: string;
    phone?: string;
    instagramHandle?: string;
  };
  skin: SkinId;
}

export type SkinId = "classic-yoga" | "default";

export interface ScheduleEntry {
  id: string;
  instructorId: string;
  venueName: string;
  venueLogoUrl?: string;
  address?: string;
  bookingUrl?: string; // external studio booking page, when SkedgeLife doesn't own booking
  times: Array<{
    day: string; // "Friday", "Saturday", ...
    label: string; // "5:30pm Intro to Level 2"
  }>;
}

export interface ServiceModality {
  id: string;
  title: string; // "Vinyasa", "Hot", "Yin", ...
  description: string;
}

export interface PrivateSessionType {
  id: string;
  title: string; // "Private Lesson", "Couples", "Corporate Class", ...
  description: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorLocation?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}
