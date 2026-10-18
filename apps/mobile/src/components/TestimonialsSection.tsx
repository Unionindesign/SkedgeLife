import React from "react";
import { StyleSheet, Text, View, type ImageSourcePropType, type TextStyle } from "react-native";
import type { ProfilePage } from "@skedgelife/data";
import type { Skin } from "@skedgelife/skins";
import { Carousel, ParallaxSection } from "@skedgelife/ui";

type Testimonial = ProfilePage["testimonials"][number];

// Testimonials as a carousel. With a background photo, the carousel floats
// over it in a translucent box and the photo moves with a parallax effect,
// after the testimonials section of Michelle's original site.
export default function TestimonialsSection({
  testimonials,
  background,
  skin,
  headingFont,
}: {
  testimonials: Testimonial[];
  background: ImageSourcePropType | undefined;
  skin: Skin;
  headingFont: TextStyle | null;
}) {
  const onPhoto = Boolean(background);
  const carousel = (
    <Carousel
      items={testimonials}
      keyOf={(t) => t.id}
      autoPlayMs={9000}
      dotColor={onPhoto ? "#fff" : skin.colors.accent}
      inactiveDotColor={onPhoto ? "rgba(255,255,255,0.45)" : "#ccc"}
      renderItem={(t) => (
        <View style={[styles.slide, onPhoto ? styles.box : { backgroundColor: skin.colors.cardBackground }]}>
          <Text style={[styles.quote, headingFont, onPhoto && styles.onPhoto]}>&ldquo;{t.quote}&rdquo;</Text>
          <Text style={[styles.author, onPhoto && styles.onPhoto]}>
            {t.author_name}
            {t.author_location ? `, ${t.author_location}` : ""}
          </Text>
        </View>
      )}
    />
  );

  if (!background) {
    return (
      <View style={styles.plain}>
        <Text style={[styles.title, headingFont]}>Testimonials</Text>
        {carousel}
      </View>
    );
  }
  return (
    <ParallaxSection image={background} overlayColor="rgba(0,0,0,0.12)" minHeight={440} style={styles.parallax}>
      {carousel}
    </ParallaxSection>
  );
}

const styles = StyleSheet.create({
  plain: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  parallax: { marginVertical: 16, paddingVertical: 48 },
  slide: { marginHorizontal: 20, borderRadius: 10, padding: 20 },
  // The original's translucent grey box, a little darker to keep white text readable on any photo.
  box: { backgroundColor: "rgba(60,60,60,0.72)", borderRadius: 8 },
  quote: { fontSize: 16, lineHeight: 24, color: "#333" },
  author: { fontSize: 13, fontStyle: "italic", color: "#555", marginTop: 12 },
  onPhoto: { color: "#fff" },
});
