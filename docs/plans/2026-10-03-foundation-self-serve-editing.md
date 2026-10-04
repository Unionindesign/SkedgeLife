# Foundation: finish self-serve editing

**Status:** Approved and built 2026-10-04. Milestone "Foundation: Auth & Self-Serve Editing". The first run of the workflow in `docs/rules/milestones.md`: after approval, everything below lands on one branch (`feature/self-serve-editing`) as one PR.

## Goal

A teacher can build their whole page from the phone: photo, logo, gallery, services, private sessions, and testimonials, on top of the bio, interests, contact, and skin that #87 shipped. The groundwork is also laid so the future web app uses the same accounts without a second auth system.

## Scope

| Issue | What gets built | Closes? |
|---|---|---|
| #37 Image upload pipeline | Pick from the library or take a photo (`expo-image-picker`), resize and compress on the phone (`expo-image-manipulator`), upload to Supabase Storage. Compressing on the phone is needed because Supabase only transforms images on its paid plan, and the originals run 1–17 MB. | Closes |
| #12 Profile photo | Tap the photo on Edit profile to change or remove it. Square crop, 800 px. | Part of #12 |
| #43 Logo upload | Same flow; the logo shows in the profile header. The accent color picker stays out of scope. | Part of #43 |
| #38 Gallery | A gallery screen: add photos (1600 px long edge), add an optional caption, drag to reorder, delete. | Closes |
| #39 / #66 Gallery limits | Free: 3 gallery photos; paid: 30. Enforced in the database; the app shows "Upgrade for more" at the limit. | Closes #39, part of #66 |
| #31 Services | List, add, edit, delete, and drag to reorder (title + description). | Closes |
| #32 Privates | Same editor, reused. | Closes |
| #35 Testimonials | Same pattern: quote, author name, optional location, reorder. | Closes |
| #12 | Everything in #12 except rates (#33, waiting on a decision). | Closes #12; rates continue in #33 |
| #14 Web session groundwork | See below. | Closes |

**Out of scope:**
- Schedule editing (#13 was closed; it's rebuilt on real times in #93).
- Rates (#33).
- The barter note (#34).
- The testimonial carousel (#36).
- The accent color picker (#43).
- Server-side image transforms.

## Database

New migration `profile_media_and_limits`:

- **Storage bucket `profile-media`**, public read. 5 MB per file; JPEG, PNG, and WebP only. Files live at `<user id>/<random id>.jpg`. Storage policies allow writes and deletes only inside your own folder. The migration creates the bucket, so `db push` sets it up on the hosted project too.
- **Photo columns store the storage path**, not a full URL. One helper in `packages/data` turns a path into a URL, so a change of project URL (or a move to a CDN) doesn't break saved rows. `imageSource()` keeps working for the bundled seed images.
- **Gallery limit**: a check on insert into `gallery_images` that reads the owner's `plan`. A logo limit too, if the logo turns out to be paid-only.
- **Row length limits** on services, privates, and testimonials (title 80, description 1,000, quote 500), so the editors can show counters like #87 does.
- **Cleaning up photos**: when a photo is replaced or deleted, the app deletes the old file. A database trigger can't delete storage files safely, so a missed delete leaves an orphan file. A cleanup job can come later; that's a TODO row, not this PR.

`packages/data` gets typed `create`, `update`, `delete`, and `reorder` functions for the three content tables and the gallery, plus `uploadProfileImage()` and `imageUrl()`.

## Screens

**Tabs become Schedule · Profile · Website** (calendar, person, and globe icons), with Profile in the middle and opening first. The Sequence Builder leaves the tab bar: it's a paid teaching tool, not something everyone needs every day. Until plan gating exists, it opens from a button on the Schedule tab, shown when "I teach" is on.

**Profile and Website are separate jobs:**
- **Profile** is the ordinary app profile: photo, name, bios, interests, teaching details, contact. Edit profile edits these, and gets the photo picker at the top.
- **Website** is where you manage your website's content. This PR scaffolds it; the visual website builder comes later.
  - It shows your future address (`skedgelife.com/<handle>`) and a **Preview** button that shows the full page with your skin.
  - It lists the sections, each opening an editor:
    - **Look:** logo and skin. The skin picker moves here from Edit profile.
    - **Services** and **Private sessions**, shown when "I teach" is on.
    - **Testimonials.**
    - **Gallery.**

**Editors:**
- **One shared list editor** for services, privates, and testimonials: drag to reorder (we already use `react-native-draggable-flatlist`), tap a row to edit it in a short form, delete with a confirmation.
- **Gallery editor:** a list of photo rows with thumbnails: add, caption, drag to reorder, delete, and a "3 of 3" count with an upgrade note at the limit.

## #14: web session groundwork

There's no web app yet (#15), so this is preparation, not wiring (that's #19):

- **Move sign-up, log-in, log-out, and the handle check into `packages/data`**, so the web app calls the same functions.
- **Write `docs/dev/auth.md`:**
  - Both apps use the same Supabase project, so they share the same accounts.
  - Mobile keeps its session in AsyncStorage; web will use `@supabase/ssr` cookies.
  - A session doesn't pass between devices; you log in on each one, as with any app.
  - The redirect URLs the web app will need.
- **Set `site_url` and the redirect URLs in `supabase/config.toml`** for the Next.js dev server (`localhost:3000`), and add a TODO row for the hosted equivalents.

## Testing

- Web build against **local** Supabase, at phone width:
  - as a new free user (hits the gallery limit and the upgrade prompt)
  - as a paid user (set `plan = 'paid'` locally with SQL)
  - as the seed account
- Storage policies: confirm user A can't overwrite or delete user B's files, using two local accounts.
- `npm run typecheck`, plus `npx expo-doctor` because new Expo packages are added.
- **On the phone checklist** in the PR:
  - camera and photo library permissions
  - picking and cropping
  - upload speed over the tunnel
  - drag to reorder
  - how photos look on the profile page

## Decisions (2026-10-04)

1. **Free plan:** profile photo, logo, and up to 3 gallery photos. **Paid:** up to 30 gallery photos.
2. **No caps on services, privates, or testimonials** for now.
3. **The page owner enters testimonials.** Later, other users may submit reviews (or a form may collect them), with the owner choosing which ones show.
4. **Tabs are Schedule · Profile · Website.** The Sequence Builder leaves the tab bar. Profile holds the ordinary profile; Website manages website content and presentation.

## After merging

- `npx supabase db push` (creates the bucket, policies, and limits on the hosted project).
- Restart Expo with `--clear`, and run through the phone checklist against the hosted project.

## Built differently from the plan

- **Photo changes save right away**, rather than with the form's Save button. This avoids orphaned uploads when someone backs out of a form.
- **Sections are edited from the Website tab**, not from "Edit" links on the profile page. That follows the Profile/Website split agreed on 2026-10-04.
- **The gallery editor is a list with thumbnails**, not a grid, because the drag-to-reorder library only supports lists.
- **On the web build, the photo picker doesn't crop to a square**; the image is center-filled instead. Cropping works on the phone.
