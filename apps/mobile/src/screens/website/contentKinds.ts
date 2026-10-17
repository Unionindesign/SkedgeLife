import type { ContentTable, ProfilePage } from "@skedgelife/data";

export type ContentKind = "services" | "privates" | "testimonials";

type FieldConfig = {
  key: string;
  label: string;
  // Matches the length checks in the profile_media_and_limits migration.
  max: number;
  required?: boolean;
  multiline?: boolean;
  // Empty text is saved as null (otherwise as an empty string).
  nullable?: boolean;
  placeholder?: string;
};

export type ContentItem = { id: string; sort_order: number; [key: string]: unknown };

type KindConfig = {
  table: ContentTable;
  title: string;
  singular: string;
  emptyText: string;
  fields: FieldConfig[];
  items: (profile: ProfilePage) => ContentItem[];
  // The main line shown in the list.
  summary: (item: ContentItem) => string;
};

const titleAndDescription: FieldConfig[] = [
  { key: "title", label: "Title", max: 80, required: true },
  { key: "description", label: "Description", max: 1000, multiline: true },
];

export const CONTENT_KINDS: Record<ContentKind, KindConfig> = {
  services: {
    table: "service_modalities",
    title: "Services",
    singular: "service",
    emptyText: "List the kinds of classes and sessions you offer, e.g. Vinyasa or Thai yoga massage.",
    fields: titleAndDescription.map((f) => (f.key === "title" ? { ...f, placeholder: "e.g. Hot Power Fusion" } : f)),
    items: (p) => p.service_modalities,
    summary: (i) => String(i.title),
  },
  privates: {
    table: "private_session_types",
    title: "Private sessions",
    singular: "private session",
    emptyText: "Describe the one-on-one or small-group sessions people can book with you.",
    fields: titleAndDescription.map((f) => (f.key === "title" ? { ...f, placeholder: "e.g. Private yoga at home" } : f)),
    items: (p) => p.private_session_types,
    summary: (i) => String(i.title),
  },
  testimonials: {
    table: "testimonials",
    title: "Testimonials",
    singular: "testimonial",
    emptyText: "Add kind words from students and clients. You choose which ones show on your page.",
    fields: [
      { key: "quote", label: "Quote", max: 500, required: true, multiline: true },
      { key: "author_name", label: "Name", max: 80, required: true },
      { key: "author_location", label: "Location", max: 80, nullable: true, placeholder: "Optional, e.g. Costa Mesa" },
    ],
    items: (p) => p.testimonials,
    summary: (i) => `“${String(i.quote)}” — ${String(i.author_name)}`,
  },
};
