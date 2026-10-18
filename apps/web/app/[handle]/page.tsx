import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { comingUp, getProfilePage, getPublicWeeklyEvents, getUpcomingOccurrences } from "@skedgelife/data";
import { getSkin } from "@skedgelife/skins";
import { ExpandableText, TabsOrAccordion } from "@skedgelife/ui/web";
import { fontFamily } from "@/lib/fonts";
import { routeHandle } from "@/lib/handles";
import { webImage } from "@/lib/images";
import { pageSections } from "@/lib/sections";
import { jsonLd, structuredData } from "@/lib/structuredData";
import { publicClient } from "@/lib/supabase";
import { Gallery } from "@/components/Gallery";
import { Schedule } from "@/components/Schedule";
import { Testimonials } from "@/components/Testimonials";
import styles from "./page.module.css";

// Rendered on the first visit, then served from cache and re-rendered in the
// background at most once a minute, so edits show up within a minute. No
// pages are built ahead of time (the empty list); each is made on demand.
export const revalidate = 60;

export async function generateStaticParams(): Promise<{ handle: string }[]> {
  return [];
}

type Props = { params: Promise<{ handle: string }> };

// One set of queries per request, shared by the page and its metadata.
const load = cache(async (handle: string) => {
  const client = publicClient();
  const profile = await getProfilePage(client, { handle });
  if (!profile) return null;
  const [weekly, upcoming] = await Promise.all([
    getPublicWeeklyEvents(client, profile.id),
    getUpcomingOccurrences(client, profile.id),
  ]);
  return { client, profile, weekly, ...comingUp(upcoming) };
});

async function resolve(params: Props["params"]) {
  const route = routeHandle((await params).handle);
  if (route.kind === "not-found") notFound();
  if (route.kind === "redirect") permanentRedirect(`/${route.handle}`);
  const data = await load(route.handle);
  if (!data) notFound();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = routeHandle((await params).handle);
  if (route.kind !== "serve") return {};
  const data = await load(route.handle);
  if (!data) return { title: "Page not found" };
  const { client, profile } = data;
  const image = webImage(client, profile.avatar_url);
  const description = profile.bio_short ?? `${profile.display_name} on SkedgeLife`;
  return {
    title: profile.display_name,
    description,
    alternates: { canonical: `/${profile.handle}` },
    openGraph: { title: profile.display_name, description, type: "profile", images: image ? [image] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary" },
  };
}

export default async function ProfileWebsite({ params }: Props) {
  const { client, profile, weekly, oneOffs, changes } = await resolve(params);
  const skin = getSkin(profile.skin);
  const { colors } = skin;
  const headingFont = fontFamily(skin.fonts.heading);
  const accentFont = fontFamily(skin.fonts.accent);
  const titleStyle = { color: colors.accent, fontFamily: headingFont };
  const logo = webImage(client, profile.logo_url);
  const headshot = webImage(client, profile.avatar_url);
  const background = webImage(client, profile.testimonials_background_url);
  const gallery = profile.gallery_images.flatMap((g) => {
    const src = webImage(client, g.url);
    return src ? [{ id: g.id, src, caption: g.caption }] : [];
  });
  const offerings = profile.teaches
    ? [
        { id: "services", title: "Services", items: profile.service_modalities },
        { id: "privates", title: "Private sessions", items: profile.private_session_types },
      ].filter((g) => g.items.length > 0)
    : [];
  const hasSchedule = weekly.length + oneOffs.length + changes.length > 0;
  const sections = pageSections(profile, { hasSchedule });
  const instagram = profile.instagram_handle?.replace(/^@/, "");
  const siteBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const siteUrl = `${siteBase}/${profile.handle}`;

  return (
    <div className={styles.page} style={{ background: colors.background }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            structuredData(profile, {
              url: siteUrl,
              image: headshot ? new URL(headshot, siteBase).toString() : null,
              oneOffs,
            }),
          ),
        }}
      />

      <header className={styles.header} style={{ background: colors.header }}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={profile.display_name} className={styles.logo} />
        ) : (
          <span className={styles.logoText} style={{ fontFamily: accentFont ?? headingFont }}>
            {profile.display_name}
          </span>
        )}
      </header>

      {sections.length > 1 ? (
        <nav className={styles.nav} aria-label="Sections">
          <ul className={styles.container}>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} style={{ color: colors.accent }}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <main>
        <section id="about" className={`${styles.container} ${styles.intro}`}>
          <div className={styles.introCard}>
            {headshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={headshot} alt="" className={styles.headshot} />
            ) : null}
            <h1
              className={styles.name}
              style={{ fontFamily: accentFont ?? headingFont, color: accentFont ? colors.accent : undefined }}
            >
              {profile.display_name}
            </h1>
            {profile.bio_short ? <p className={styles.bioShort}>{profile.bio_short}</p> : null}
          </div>
          {profile.bio_long ? (
            <div className={styles.bio} style={{ background: colors.cardBackground }}>
              <h2 className={styles.sectionTitle} style={{ fontFamily: headingFont }}>
                Bio
              </h2>
              <ExpandableText text={profile.bio_long} linkColor={colors.accent} />
            </div>
          ) : null}
        </section>

        {profile.interests.length > 0 ||
        (profile.teaches && profile.specialties.length + profile.certifications.length > 0) ? (
          <section className={`${styles.container} ${styles.twoCol}`}>
            {profile.teaches && profile.specialties.length > 0 ? (
              <div>
                <h2 className={styles.sectionTitle} style={titleStyle}>
                  Specialties
                </h2>
                <ul className={styles.tags}>
                  {profile.specialties.map((s) => (
                    <li key={s} style={{ background: colors.accent }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {profile.teaches && profile.certifications.length > 0 ? (
              <div>
                <h2 className={styles.sectionTitle} style={titleStyle}>
                  Certifications
                </h2>
                <ul className={styles.bullets}>
                  {profile.certifications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {profile.interests.length > 0 ? (
              <div>
                <h2 className={styles.sectionTitle} style={titleStyle}>
                  Interests
                </h2>
                <ul className={styles.tags}>
                  {profile.interests.map((i) => (
                    <li
                      key={i}
                      className={styles.outlineTag}
                      style={{ borderColor: colors.accent, color: colors.accent }}
                    >
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {offerings.length > 0 ? (
          <section id="offerings" className={styles.band} style={{ background: colors.band }}>
            <div className={`${styles.container} ${styles.offerings}`}>
              {offerings.map((group) => (
                <div key={group.id}>
                  <h2 className={styles.sectionTitle} style={titleStyle}>
                    {group.title}
                  </h2>
                  <TabsOrAccordion
                    label={group.title}
                    accentColor={colors.accent}
                    titleStyle={{ fontFamily: headingFont }}
                    items={group.items.map((item) => ({
                      key: item.id,
                      title: item.title,
                      content: item.description ? <p>{item.description}</p> : null,
                    }))}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {hasSchedule ? (
          <section id="schedule" className={styles.container}>
            <h2 className={styles.sectionTitle} style={titleStyle}>
              Schedule
            </h2>
            <Schedule
              weekly={weekly}
              oneOffs={oneOffs}
              changes={changes}
              accent={colors.accent}
              headingFont={headingFont}
            />
          </section>
        ) : null}

        {profile.testimonials.length > 0 ? (
          <section id="testimonials" aria-label="Testimonials" className={styles.testimonials}>
            {!background ? (
              <h2 className={`${styles.sectionTitle} ${styles.container}`} style={titleStyle}>
                Testimonials
              </h2>
            ) : null}
            <Testimonials
              testimonials={profile.testimonials}
              background={background}
              accent={colors.accent}
              cardBackground={colors.cardBackground}
              headingFont={headingFont}
            />
          </section>
        ) : null}

        {gallery.length > 0 ? (
          <section id="gallery" className={styles.container}>
            <h2 className={styles.sectionTitle} style={titleStyle}>
              Gallery
            </h2>
            <Gallery photos={gallery} name={profile.display_name} />
          </section>
        ) : null}
      </main>

      <footer id="contact" className={styles.footer} style={{ background: colors.footer, color: colors.footerText }}>
        <div className={styles.container}>
          <p className={styles.footerName} style={{ fontFamily: accentFont ?? headingFont }}>
            {profile.display_name}
          </p>
          {profile.bio_short ? <p className={styles.footerTagline}>{profile.bio_short}</p> : null}
          <ul className={styles.contact}>
            {profile.contact_email ? (
              <li>
                <a href={`mailto:${profile.contact_email}`}>{profile.contact_email}</a>
              </li>
            ) : null}
            {profile.contact_phone ? (
              <li>
                <a href={`tel:${profile.contact_phone.replace(/[^0-9+]/g, "")}`}>{profile.contact_phone}</a>
              </li>
            ) : null}
            {instagram ? (
              <li>
                <a
                  href={`https://instagram.com/${encodeURIComponent(instagram)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{instagram}
                </a>
              </li>
            ) : null}
          </ul>
          <p className={styles.footerSmall}>
            © {new Date().getFullYear()} {profile.display_name}
            {/* The free plan's footer credit; paid sites can turn it off once billing exists. */}
            {profile.plan !== "paid" ? (
              <>
                {" · "}
                <Link href="/">Made with SkedgeLife</Link>
              </>
            ) : null}
          </p>
        </div>
      </footer>
    </div>
  );
}
