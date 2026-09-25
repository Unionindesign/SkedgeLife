import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Linking } from "react-native";
import { skins } from "../theme/skins";
import {
  seedInstructor,
  seedServiceModalities,
  seedPrivateSessionTypes,
  seedTestimonials,
  seedGallery,
} from "../data/seedInstructor";

const logo = require("../../assets/instructor-seed/logo-MichelleRose.png");
const headshot = require("../../assets/instructor-seed/bio-sqSmile.png");
const galleryImages: Record<string, any> = {
  "instructor-seed/gal-headStand.png": require("../../assets/instructor-seed/gal-headStand.png"),
  "instructor-seed/CamelGroup.jpeg": require("../../assets/instructor-seed/CamelGroup.jpeg"),
  "instructor-seed/gal-treePool.png": require("../../assets/instructor-seed/gal-treePool.png"),
};

export default function InstructorProfileScreen() {
  const skin = skins[seedInstructor.skin];
  // Custom fonts load as a single weight; a bold fontWeight makes Android fall back to the system font.
  const headingFont = skin.fonts.heading ? { fontFamily: skin.fonts.heading, fontWeight: "normal" as const } : null;
  const accentFont = skin.fonts.accent
    ? { fontFamily: skin.fonts.accent, fontWeight: "normal" as const, fontSize: 34 }
    : null;

  return (
    <ScrollView style={{ backgroundColor: skin.colors.background }} contentContainerStyle={styles.container}>
      <View style={[styles.header, { backgroundColor: skin.colors.header }]}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.section}>
        <Image source={headshot} style={styles.headshot} />
        <Text style={[styles.name, { color: skin.colors.headingText }, accentFont]}>{seedInstructor.displayName}</Text>
        {seedInstructor.bioShort ? <Text style={styles.bioShort}>{seedInstructor.bioShort}</Text> : null}
      </View>

      <View style={[styles.card, { backgroundColor: skin.colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, headingFont]}>Bio</Text>
        <Text style={styles.bodyText}>{seedInstructor.bioLong}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Specialties</Text>
        <View style={styles.tagRow}>
          {seedInstructor.specialties.map((s) => (
            <View key={s} style={[styles.tag, { backgroundColor: skin.colors.accent }]}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Certifications</Text>
        {seedInstructor.certifications.map((c) => (
          <Text key={c} style={styles.bodyText}>
            • {c}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Services</Text>
        {seedServiceModalities.map((m) => (
          <View key={m.id} style={{ marginBottom: 10 }}>
            <Text style={styles.serviceTitle}>{m.title}</Text>
            <Text style={styles.bodyText}>{m.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Privates</Text>
        {seedPrivateSessionTypes.map((p) => (
          <View key={p.id} style={{ marginBottom: 10 }}>
            <Text style={styles.serviceTitle}>{p.title}</Text>
            <Text style={styles.bodyText}>{p.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Testimonials</Text>
        {seedTestimonials.map((t) => (
          <View key={t.id} style={{ marginBottom: 14 }}>
            <Text style={styles.bodyText}>&ldquo;{t.quote}&rdquo;</Text>
            <Text style={styles.testimonialAuthor}>
              — {t.authorName}
              {t.authorLocation ? `, ${t.authorLocation}` : ""}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Gallery</Text>
        <View style={styles.galleryRow}>
          {seedGallery.map((g) => (
            <Image key={g.id} source={galleryImages[g.url]} style={styles.galleryImage} />
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.contactSection]}>
        <Text style={[styles.sectionTitle, headingFont]}>Contact</Text>
        <Text style={styles.bodyText} onPress={() => Linking.openURL(`mailto:${seedInstructor.contact.email}`)}>
          {seedInstructor.contact.email}
        </Text>
        {seedInstructor.contact.phone ? <Text style={styles.bodyText}>{seedInstructor.contact.phone}</Text> : null}
        {seedInstructor.contact.instagramHandle ? (
          <Text style={styles.bodyText}>{seedInstructor.contact.instagramHandle}</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  header: { alignItems: "center", paddingVertical: 24 },
  logo: { width: 220, height: 80 },
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  card: { marginHorizontal: 20, borderRadius: 10, padding: 18 },
  headshot: { width: 140, height: 140, borderRadius: 70, alignSelf: "center", marginBottom: 12 },
  name: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  bioShort: { textAlign: "center", marginTop: 6, fontSize: 14, color: "#555" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  bodyText: { fontSize: 14, lineHeight: 20, color: "#333" },
  serviceTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  testimonialAuthor: { fontSize: 12, color: "#666", marginTop: 4 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  tagText: { color: "#fff", fontSize: 12 },
  galleryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  galleryImage: { width: 100, height: 100, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  contactSection: { paddingBottom: 40 },
});
