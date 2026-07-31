# SkedgeLife — Instructor Mini-Site ("Skin") User Stories

Grounded in real content pulled from Michelle Scutti's 2017 Wild Rose Yoga React site (`michelle-scutti` repo, her first React project) — used only as a source of real instructor content (bio, photos, logo, contact, schedule, services), not as a design or code reference. SkedgeLife is a new app with its own database(s) and backend; this is not a rebuild of that site.

## Context

SkedgeLife gives small-business instructors (yoga, fitness, and beyond) an inexpensive, mobile-first "website" — early-2000s-MySpace-style customizable skins over a simple, consistent content structure. No feed, no scrolling discovery — students like/follow specific instructors and get push/email notifications. Michelle's old site content is useful here because it's real-world instructor content already organized into the sections a mini-site needs (bio, schedule, services, testimonials, gallery, contact) — a stand-in for what real seed data looks like, not a template for how the new app should look.

## Epic 1: Instructor Profile & Bio

- As an instructor, I want to create a bio with a profile photo and short/long descriptions, so students get a sense of who I am and my teaching background before booking.
  - Reference: Michelle's bio combines a circular headshot, a 2-paragraph story (training history, style, philosophy), and a "specialties" strip (Yoga / Massage / Travel) each with an icon and short blurb.
- As an instructor, I want to list my certifications and specialties as distinct tags or cards (e.g., RYT-200, Yin, Hot Power Fusion), so students can filter/understand what I teach without reading the full bio.
- As a student, I want to view an instructor's bio from their profile before following or booking, so I can decide if their style fits me.

## Epic 2: Class Schedule

- As an instructor, I want to list recurring class times grouped by day and location, so students always see where to find me this week.
  - Reference: Michelle's schedule is a set of "studio cards" (one per venue) — each with the studio's logo, a day-by-day time list, and a link out to that studio's booking page.
- As an instructor, I want to link each class listing to an external studio booking page (when I don't control booking myself), so students can complete registration wherever it actually lives.
- As an instructor, I want to add a map showing all my teaching locations, so students can find the studio nearest them.
- As an instructor, I want a schedule state for "no public classes right now, privates only," so my page still looks intentional between studio contracts.
- As a student, I want to see "what's on tonight" at a glance, so I can decide last-minute whether to go.

## Epic 3: Services & Offerings

- As an instructor, I want to describe the different class styles/modalities I teach (e.g., Vinyasa, Yin, Hot, Nidra, Prenatal) as expandable entries, so students can learn what each style means without cluttering the main page.
  - Reference: Michelle's site uses a tabbed layout (Yoga / Massage / Privates / Rates) with pop-up detail cards per modality.
- As an instructor, I want a "Privates" section listing session types (1:1, couples, corporate, kids, weddings) with short descriptions, so I can capture non-recurring/custom bookings.
- As an instructor, I want a "Rates" area that can say "inquire for pricing" instead of requiring fixed public prices, so I'm not locked into publishing rates I want to negotiate.
- As an instructor, I want to note that I'm open to collaboration, trade, or barter, so I can attract non-cash opportunities (this is a real, recurring need for solo instructors).

## Epic 4: Testimonials & Social Proof

- As an instructor, I want to feature a rotating set of student testimonials (quote + first name + city), so new visitors get social proof without me managing a review platform.
- As a student, I want to read what other students say about an instructor, so I can gauge fit before following/booking.

## Epic 5: Gallery / Media

- As an instructor, I want to upload a small photo gallery (4–8 images) of me teaching/traveling, so my page feels personal and current, not a wall of text.
- As an instructor, I want images auto-compressed/resized on upload, so my page stays fast even if I upload large phone photos (Michelle's originals ranged 1–17MB — unusable as-is on mobile).

## Epic 6: Branding / "Skin"

- As an instructor, I want to upload my own logo and pick an accent color palette, so my mini-site feels like my brand, not a generic template.
- As an instructor, I want a small set of pre-built "skins" (color + font pairings) I can apply in one tap, so I get a distinctive look without needing design skills.
  - Candidate v1 skin — "Classic Yoga": Michelle's 2017 site's palette/font pairing (maroon + teal, Arvo + Great Vibes) and section order (Landing → About → Bio → Schedule → Services → Testimonials → Gallery → Footer) is a real, already-designed look worth packaging as the first genre-appropriate skin option, rebuilt fresh in NextJS rather than ported from the old Materialize-based code. See content/asset reference doc for full spec.
- As an instructor, I want my site's nav to auto-generate from the sections I've filled in (Bio, Schedule, Services, Testimonials, Gallery), so I don't manage navigation manually.

## Epic 7: Contact & Follow

- As an instructor, I want a persistent contact block (email, phone, Instagram handle) in my header/footer, so students always know how to reach me.
- As a student, I want a one-tap "Contact" action that opens email/message, so I can ask about rates or private sessions without hunting for an address.
- As a student, I want to follow an instructor so I get notified of schedule changes, without a public feed or scrolling timeline (per SkedgeLife's no-feed principle).

## Open questions for later refinement

- Should schedule cards support studios where SkedgeLife *does* own the booking flow (vs. link-out only), and how do the two states look different to the student?
- How many gallery images / how much bio text is "enough" before it should collapse behind a "read more" — Michelle's bio is ~230 words across 2 paragraphs, worth using as a rough baseline.
- Do rates stay "inquire only" by default, or does SkedgeLife want a structured price-list option for instructors who want fixed pricing?
