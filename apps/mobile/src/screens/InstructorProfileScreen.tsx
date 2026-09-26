import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Linking } from "react-native";
import { getSkin } from "@skedgelife/skins";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import { imageSource } from "../lib/images";

export default function InstructorProfileScreen() {
  const { state, reload } = useProfile();
  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;

  const profile = state.profile;
  const skin = getSkin(profile.skin);
  const logo = imageSource(profile.logo_url);
  const headshot = imageSource(profile.avatar_url);
  // Custom fonts load as a single weight; a bold fontWeight makes Android fall back to the system font.
  const headingFont = skin.fonts.heading ? { fontFamily: skin.fonts.heading, fontWeight: "normal" as const } : null;
  const accentFont = skin.fonts.accent
    ? { fontFamily: skin.fonts.accent, fontWeight: "normal" as const, fontSize: 34 }
    : null;

  return (
    <ScrollView style={{ backgroundColor: skin.colors.background }} contentContainerStyle={styles.container}>
      <View style={[styles.header, { backgroundColor: skin.colors.header }]}>
        {logo ? <Image source={logo} style={styles.logo} resizeMode="contain" /> : null}
      </View>

      <View style={styles.section}>
        {headshot ? <Image source={headshot} style={styles.headshot} /> : null}
        <Text style={[styles.name, { color: skin.colors.headingText }, accentFont]}>{profile.display_name}</Text>
        {profile.bio_short ? <Text style={styles.bioShort}>{profile.bio_short}</Text> : null}
      </View>

      {profile.bio_long ? (
        <View style={[styles.card, { backgroundColor: skin.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, headingFont]}>Bio</Text>
          <Text style={styles.bodyText}>{profile.bio_long}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Specialties</Text>
        <View style={styles.tagRow}>
          {profile.specialties.map((s) => (
            <View key={s} style={[styles.tag, { backgroundColor: skin.colors.accent }]}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Certifications</Text>
        {profile.certifications.map((c) => (
          <Text key={c} style={styles.bodyText}>
            • {c}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Services</Text>
        {profile.service_modalities.map((m) => (
          <View key={m.id} style={{ marginBottom: 10 }}>
            <Text style={styles.serviceTitle}>{m.title}</Text>
            <Text style={styles.bodyText}>{m.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Privates</Text>
        {profile.private_session_types.map((p) => (
          <View key={p.id} style={{ marginBottom: 10 }}>
            <Text style={styles.serviceTitle}>{p.title}</Text>
            <Text style={styles.bodyText}>{p.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Testimonials</Text>
        {profile.testimonials.map((t) => (
          <View key={t.id} style={{ marginBottom: 14 }}>
            <Text style={styles.bodyText}>&ldquo;{t.quote}&rdquo;</Text>
            <Text style={styles.testimonialAuthor}>
              — {t.author_name}
              {t.author_location ? `, ${t.author_location}` : ""}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, headingFont]}>Gallery</Text>
        <View style={styles.galleryRow}>
          {profile.gallery_images.map((g) => {
            const source = imageSource(g.url);
            return source ? <Image key={g.id} source={source} style={styles.galleryImage} /> : null;
          })}
        </View>
      </View>

      <View style={[styles.section, styles.contactSection]}>
        <Text style={[styles.sectionTitle, headingFont]}>Contact</Text>
        {profile.contact_email ? (
          <Text style={styles.bodyText} onPress={() => Linking.openURL(`mailto:${profile.contact_email}`)}>
            {profile.contact_email}
          </Text>
        ) : null}
        {profile.contact_phone ? <Text style={styles.bodyText}>{profile.contact_phone}</Text> : null}
        {profile.instagram_handle ? <Text style={styles.bodyText}>{profile.instagram_handle}</Text> : null}
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
