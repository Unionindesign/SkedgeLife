import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Linking, Pressable, type TextStyle, type ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getSkin } from "@skedgelife/skins";
import type { MainStackParamList } from "../navigation/RootNavigator";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import { imageSource } from "../lib/images";

export default function InstructorProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
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

  const gallery = profile.gallery_images.flatMap((g) => {
    const source = imageSource(g.url);
    return source ? [{ id: g.id, source }] : [];
  });
  const hasContact = Boolean(profile.contact_email || profile.contact_phone || profile.instagram_handle);
  const teachingCount = profile.teaches
    ? profile.specialties.length + profile.certifications.length + profile.service_modalities.length +
      profile.private_session_types.length
    : 0;
  const hasContent =
    Boolean(profile.bio_short || profile.bio_long) ||
    teachingCount + profile.interests.length + profile.testimonials.length + gallery.length > 0 ||
    hasContact;

  return (
    <ScrollView style={{ backgroundColor: skin.colors.background }} contentContainerStyle={styles.container}>
      <View style={[styles.header, { backgroundColor: skin.colors.header }]}>
        {logo ? <Image source={logo} style={styles.logo} resizeMode="contain" /> : null}
      </View>

      <View style={styles.section}>
        {headshot ? <Image source={headshot} style={styles.headshot} /> : null}
        <Text style={[styles.name, { color: skin.colors.headingText }, accentFont]}>{profile.display_name}</Text>
        {profile.bio_short ? <Text style={styles.bioShort}>{profile.bio_short}</Text> : null}
        <Pressable
          onPress={() => navigation.navigate("EditProfile")}
          style={[styles.editButton, { borderColor: skin.colors.accent }]}
        >
          <Text style={[styles.editText, { color: skin.colors.accent }]}>Edit profile</Text>
        </Pressable>
      </View>

      {profile.bio_long ? (
        <View style={[styles.card, { backgroundColor: skin.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, headingFont]}>Bio</Text>
          <Text style={styles.bodyText}>{profile.bio_long}</Text>
        </View>
      ) : null}

      {!hasContent ? (
        <Text style={styles.emptyHint}>Your page is ready. Tap Edit profile to add your bio, interests, and contact details.</Text>
      ) : null}

      {profile.interests.length > 0 ? (
        <Section title="Interests" titleStyle={headingFont}>
          <View style={styles.tagRow}>
            {profile.interests.map((i) => (
              <View key={i} style={[styles.tag, styles.interestTag, { borderColor: skin.colors.accent }]}>
                <Text style={[styles.interestText, { color: skin.colors.accent }]}>{i}</Text>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {profile.teaches && profile.specialties.length > 0 ? (
        <Section title="Specialties" titleStyle={headingFont}>
          <View style={styles.tagRow}>
            {profile.specialties.map((s) => (
              <View key={s} style={[styles.tag, { backgroundColor: skin.colors.accent }]}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {profile.teaches && profile.certifications.length > 0 ? (
        <Section title="Certifications" titleStyle={headingFont}>
          {profile.certifications.map((c) => (
            <Text key={c} style={styles.bodyText}>
              • {c}
            </Text>
          ))}
        </Section>
      ) : null}

      {profile.teaches && profile.service_modalities.length > 0 ? (
        <Section title="Services" titleStyle={headingFont}>
          {profile.service_modalities.map((m) => (
            <View key={m.id} style={{ marginBottom: 10 }}>
              <Text style={styles.serviceTitle}>{m.title}</Text>
              <Text style={styles.bodyText}>{m.description}</Text>
            </View>
          ))}
        </Section>
      ) : null}

      {profile.teaches && profile.private_session_types.length > 0 ? (
        <Section title="Privates" titleStyle={headingFont}>
          {profile.private_session_types.map((p) => (
            <View key={p.id} style={{ marginBottom: 10 }}>
              <Text style={styles.serviceTitle}>{p.title}</Text>
              <Text style={styles.bodyText}>{p.description}</Text>
            </View>
          ))}
        </Section>
      ) : null}

      {profile.testimonials.length > 0 ? (
        <Section title="Testimonials" titleStyle={headingFont}>
          {profile.testimonials.map((t) => (
            <View key={t.id} style={{ marginBottom: 14 }}>
              <Text style={styles.bodyText}>&ldquo;{t.quote}&rdquo;</Text>
              <Text style={styles.testimonialAuthor}>
                — {t.author_name}
                {t.author_location ? `, ${t.author_location}` : ""}
              </Text>
            </View>
          ))}
        </Section>
      ) : null}

      {gallery.length > 0 ? (
        <Section title="Gallery" titleStyle={headingFont}>
          <View style={styles.galleryRow}>
            {gallery.map(({ id, source }) => (
              <Image key={id} source={source} style={styles.galleryImage} />
            ))}
          </View>
        </Section>
      ) : null}

      {hasContact ? (
        <Section title="Contact" titleStyle={headingFont} style={styles.contactSection}>
          {profile.contact_email ? (
            <Text style={styles.bodyText} onPress={() => Linking.openURL(`mailto:${profile.contact_email}`)}>
              {profile.contact_email}
            </Text>
          ) : null}
          {profile.contact_phone ? <Text style={styles.bodyText}>{profile.contact_phone}</Text> : null}
          {profile.instagram_handle ? <Text style={styles.bodyText}>{profile.instagram_handle}</Text> : null}
        </Section>
      ) : null}
    </ScrollView>
  );
}

function Section({
  title,
  titleStyle,
  style,
  children,
}: {
  title: string;
  titleStyle: TextStyle | null;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, style]}>
      <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
      {children}
    </View>
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
  editButton: { alignSelf: "center", marginTop: 14, borderWidth: 1, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6 },
  editText: { fontSize: 14, fontWeight: "600" },
  interestTag: { backgroundColor: "transparent", borderWidth: 1 },
  interestText: { fontSize: 12 },
  emptyHint: { paddingHorizontal: 20, paddingVertical: 16, fontSize: 14, color: "#666", textAlign: "center" },
});
