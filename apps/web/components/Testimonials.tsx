"use client";

import { Carousel, ParallaxSection } from "@skedgelife/ui/web";
import styles from "./Testimonials.module.css";

export type Testimonial = { id: string; quote: string; author_name: string; author_location: string | null };

// Testimonials as a carousel; over the background photo with a parallax
// effect when there is one, after the app's TestimonialsSection.
export function Testimonials({
  testimonials,
  background,
  accent,
  cardBackground,
  headingFont,
}: {
  testimonials: Testimonial[];
  background: string | null;
  accent: string;
  cardBackground: string;
  headingFont?: string;
}) {
  const onPhoto = Boolean(background);
  const carousel = (
    <Carousel
      label="Testimonials"
      items={testimonials}
      keyOf={(t) => t.id}
      autoPlayMs={9000}
      dotColor={onPhoto ? "#fff" : accent}
      inactiveDotColor={onPhoto ? "rgba(255,255,255,0.45)" : "#ccc"}
      renderItem={(t) => (
        <blockquote
          className={onPhoto ? styles.box : styles.card}
          style={onPhoto ? undefined : { background: cardBackground }}
        >
          <p className={styles.quote} style={{ fontFamily: headingFont }}>
            &ldquo;{t.quote}&rdquo;
          </p>
          <footer className={styles.author}>
            {t.author_name}
            {t.author_location ? `, ${t.author_location}` : ""}
          </footer>
        </blockquote>
      )}
    />
  );

  if (!background) return <div className={styles.plain}>{carousel}</div>;
  return (
    <ParallaxSection image={background} overlayColor="rgba(0,0,0,0.15)" minHeight={460} className={styles.parallax}>
      <div className={styles.inner}>{carousel}</div>
    </ParallaxSection>
  );
}
