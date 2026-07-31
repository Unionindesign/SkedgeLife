# Wild Rose Yoga (Michelle Scutti) — Content & Asset Reference

Source: `michelle-scutti` React SPA, built 2017 — an early personal project, Michelle Scutti's first React app. Not a design to carry forward.

**Purpose of this doc:** SkedgeLife is a new app with its own database(s) and backend — this is not a rebuild of the Wild Rose Yoga site, and none of its visual design (colors, fonts, layout) is meant to be reused. What's useful here is the *real content* — bio, photos, logo, contact info, class schedule, service descriptions — which can serve as living placeholder/seed data while building and demoing SkedgeLife's instructor mini-site feature, standing in for what a real instructor's data will eventually look like in the database.

## Brand basics

- Business name on site: "Wild Rose Yoga" (footer copyright), site owner Michelle Scutti
- Contact: michellescutti@gmail.com · 720-291-1930 · Instagram @Michelle84Mabelle
- Original site credit: "Website by Union in Design"

## Candidate first "skin": Classic Yoga

Not being reused as *the* SkedgeLife design — but this 2017 palette/font/layout is a real, already-designed look that could become the first pre-built skin option (working name "Classic Yoga") when the NextJS SSR skin system gets built. It saves designing a v1 skin from scratch, and gives yoga instructors a genre-appropriate default.

**Color palette:** Maroon `#7a484f` (header), Teal `#00695c` (sub-nav/accent), light teal/green `#b2dfdb` (card background), gray `#afafaf` (heading text), dark gray `#585858` (badge/quote bg), white `#ffffff` (section bg).

**Typography:** Headings in Arvo (serif), cursive accent in Great Vibes, body on system sans-serif.

**Page order (as a section-order template):** Header/Nav → Top Landing (image slider) → About (3 icon cards) → Bio → Schedule → Services (tabs/modals) → Testimonials (carousel) → Gallery (4-image grid) → Footer.

Before adopting wholesale: this was a first React project, so the layout patterns (Materialize-based tabs/modals/parallax) should be treated as *inspiration for section order and color/font pairing only* — the actual NextJS implementation should be built fresh, not ported from this jQuery-era component code.

## Bio copy (verbatim, for reuse as seed/placeholder content)

> Michelle Scutti is a Southern California native raising that good vibration on and off the mat. She stands in her truth and radiantly and authentically shines. She has been practicing yoga for 15 years and teaching for 11 years. Light on her feet, consistent in her optimism and strong in her practice, she completed her first RYT 200 hour training 2011 in Denver, Colorado. Following her dream of adventure and living a more simple life, she moved to Montezuma Costa Rica and offered classes in the style of Vinyasa, Yin and Thai Massage for Montezuma Yoga. She also offered Vinyasa classes at the gorgeous Ylang Ylang Beach Resort and Rancho Delicioso a Permaculture Farm for Anamaya Resort.
>
> Now back in Orange County Michelle is offering public and private classes in the style of Hot Power Fusion, Yin Yoga, Hot Yoga, Vinyasa, Meditation, and Kids Yoga. She is humbled to connect with this ancient lineage on a deeper level. Lately she is intrigued by and studying Tantric Vinyasa. Each class explores intelligent Vinyasa sequences guided by principles of alignment, pranayama, meditation, and other techniques for awakening our inner fire and stabilizing the mind. She infuses her classes with compassion, joy, and love. She looks forward to meeting you!

## Class schedule (active card at time of snapshot)

**Ra Yoga — Mission Viejo Studio**
- Friday: 5:30pm Intro to Level 2 · 7:30pm Hot Ra – Candlelit
- Saturday: 8:30am Hot Ra · 10:00am Intro to Level 2

(Commented-out/inactive cards in code show prior studios: CorePower Yoga Irvine, Purple Yoga Huntington Beach/Long Beach, The Wild Yogi Aliso Viejo — useful as examples of the "multiple studio affiliations over time" pattern.)

## Services / modalities offered

- **Yoga styles:** Vinyasa, Hot, Yin, Nidra, Prenatal (each has a 2–4 sentence description, shown in a modal)
- **Massage:** Thai Yoga Massage, 60/90 min sessions, certified via TTC Spa School (Chiang Mai, Thailand)
- **Privates:** Private lesson, Couples, Corporate class, Kids yoga, Weddings
- **Rates:** inquire-for-quote model; open to collaboration, workshops, retreats, live-music yoga, and barter/trade (e.g., Spanish lessons, guitar, belly dancing)

## Testimonials (3, carousel)

1. Michelle W., Denver, CO — on spiritual connection and mindfulness in class
2. Crystal C. — met as a studio cleaner, on calming energy and Hot Power Fusion
3. McKenzie, Winter Park, CO — met in Costa Rica, on healing and Thai massage

## Image asset inventory

Located in `src/images/`. Grouped by original usage; useful as real photos/logos to seed instructor profiles during development. Large raw files flagged for compression before reuse.

**Logos / branding**
- `logo-MichelleRose.png` — main header/footer logo
- `logo-rose.png`, `rayoga-logo.svg`, `RaYogaLogo.gif`, `WildYogiLogo.png`, `PurpleYogaLogo.png`, `PURPLE+YOGA_FINAL+2.png`, `cpylogo.png`, `yogapod-logo.jpg` — partner studio logos (schedule cards)
- `Michelle Rose Logo_1.pdf` — vector/print version of main logo
- `instalogo.png` — Instagram icon

**Landing / hero**
- `landing-fixedFirmWaves.png`, `landing-costaTrees.png`, `landing-wheelAspens.png` (9.1MB — needs compression), `landing-pigeonBack.png`, `landing-seatedSmile-sq.png`

**Bio**
- `bio-sqSmile.png` (circular headshot), `bio-beachParallax.png` (3.8MB), `bio-treeGrn.png` (1.5MB)

**Gallery**
- `gal-headStand.png` (1.9MB), `gal-wheelAspen.png` (**17MB — largest file in repo, must compress**), `CamelGroup.jpeg`, `gal-treePool.png`, `gal-veniceCanal.png` (11MB, unused in current code), `gal-redRocksSquare.png` (4.8MB, unused), `gal-revBigToe.png` (3.6MB, unused), `gal-funnyFaces.png` (4.3MB, unused), `gal-matRiver.png` (952KB, unused), `gal-malaHands.png` (unused)

**Services icons**
- `iconOm.png`, `iconMassage.png`, `iconGlobe.png` (About section)
- `srv-yogaDenaeMichelle.png`, `srv-Massage.png`, `srv-privateKidMat.png`, `srv-yogaGroup.png`
- `squareTree.png` (services hero image)

**Testimonials background**
- `italy.png` (3.0MB)

**Marketing / flyers**
- `9_13_19_yoga_flyer.pdf` / `.png` (event flyer, useful as an example of promo-graphic style)

**Unused / raw source material** (`src/images/raw/`)
- ~25 unprocessed photos (screenshots, event photos, a `redrocksyogagradient.psd`) — extra pool of real photos if more variety is needed than the current 4-image gallery, but not currently wired into the old site.

## How this content will be used

- This is seed/placeholder data for exercising SkedgeLife's instructor profile, schedule, services, and gallery features during development and demos — not a design or content spec to match.
- The `raw/` folder and commented-out imports together represent a *larger* real-photo pool than what was live on the old site, useful if a seeded demo profile wants more variety than 4 gallery images.
- Many originals are unoptimized (1–17MB pngs) — fine to import as-is for dev/seed purposes, but confirms the need for auto-compression on real instructor uploads in the actual app (already captured as a user story in Epic 5 of the user stories doc).
- The logo, bio, contact info, and schedule/services text are genuine, reusable content (this really is Michelle's info) — everything else about the old site (its visual design, code, and structure) can be ignored.
