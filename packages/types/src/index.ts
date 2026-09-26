// Core data model types for SkedgeLife.
// Sequence/pose shapes follow the schema sketched in the product ideation doc:
//   poses (id, name_en, name_sanskrit, category, icon_svg_url, default_duration_sec)
//   sequences (id, instructor_id, title, quote text, playlist_url, created_at)
//   sequence_items (id, sequence_id, pose_id, order_index, duration_sec, side enum('L','R','N/A'), cue_note)
//   sequence_class_link (sequence_id, class_instance_id)
//
// These are UI-facing TypeScript shapes the screens are built against. The
// database schema's types are generated into ./database.ts (npm run db:types).

export type { Database, Json } from "./database";

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

// Must match the skin check constraint on public.profiles.
export type SkinId = "classic-yoga" | "default";
