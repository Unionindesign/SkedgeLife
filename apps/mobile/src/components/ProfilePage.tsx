import React from "react";
import { View, Text, Image, StyleSheet, Linking, Pressable, type TextStyle, type ViewStyle } from "react-native";
import type { ProfilePage as ProfilePageData } from "@skedgelife/data";
import { getSkin } from "@skedgelife/skins";
import { ExpandableText, ParallaxScrollView, TabsOrAccordion } from "@skedgelife/ui";
import { imageSource } from "../lib/images";
import TestimonialsSection from "./TestimonialsSection";
import WebsiteFooter from "./WebsiteFooter";

type Props = {
  profile: ProfilePageData;
  // "profile" is the app profile (photo, bios, interests, teaching details,
  // contact). "website" adds the website content: logo, services, privates,
  // testimonials, and gallery.
  variant: "profile" | "website";
  // Shown under the name, e.g. the Edit profile button.
  action?: { label: string; onPress: () => void };
  emptyHint?: string;
};

export default function ProfilePage({ profile, variant, action, emptyHint }: Props) {
  const website = variant === "website";
  const skin = getSkin(profile.skin);
  const logo = imageSource(profile.logo_url);
  const headshot = imageSource(profile.avatar_url);
  // Custom fonts load as a single weight; a bold fontWeight makes Android fall back to the system font.
  const headingFont = skin.fonts.heading ? { fontFamily: skin.fonts.heading, fontWeight: "normal" as const } : null;
  // Section titles take the skin's accent color, so the page isn't all black on white.
  const titleStyle: TextStyle = { ...headingFont, color: skin.colors.accent };
  const accentFont = skin.fonts.accent
    ? { fontFamily: skin.fonts.accent, fontWeight: "normal" as const, fontSize: 34 }
    : null;

  const gallery = (website ? profile.gallery_images : []).flatMap((g) => {
    const source = imageSource(g.url);
    return source ? [{ id: g.id, source }] : [];
  });
  const hasContact = Boolean(profile.contact_email || profile.contact_phone || profile.instagram_handle);
  const services = website && profile.teaches ? profile.service_modalities : [];
  const privates = website && profile.teaches ? profile.private_session_types : [];
  const testimonials = website ? profile.testimonials : [];
  const teachingCount = profile.teaches
    ? profile.specialties.length + profile.certifications.length + services.length + privates.length
    : 0;
  const hasContent =
    Boolean(profile.bio_short || profile.bio_long) ||
    teachingCount + profile.interests.length + testimonials.length + gallery.length > 0 ||
    hasContact;

  return (
    // A ParallaxScrollView so sections (testimonials, for now) can have moving backgrounds.
    <ParallaxScrollView
      style={{ backgroundColor: skin.colors.background }}
      contentContainerStyle={website ? styles.websiteContainer : styles.container}
    >
      {website ? (
        <View style={[styles.header, { backgroundColor: skin.colors.header }]}>
          {logo ? <Image source={logo} style={styles.logo} resizeMode="contain" /> : null}
        </View>
      ) : null}

      <View style={styles.section}>
        {headshot ? <Image source={headshot} style={styles.headshot} /> : null}
        <Text style={[styles.name, { color: skin.colors.headingText }, accentFont]}>{profile.display_name}</Text>
        {profile.bio_short ? <Text style={styles.bioShort}>{profile.bio_short}</Text> : null}
        {action ? (
          <Pressable onPress={action.onPress} style={[styles.editButton, { borderColor: skin.colors.accent }]}>
            <Text style={[styles.editText, { color: skin.colors.accent }]}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>

      {profile.bio_long ? (
        <View style={[styles.card, { backgroundColor: skin.colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, headingFont]}>Bio</Text>
          <ExpandableText text={profile.bio_long} style={styles.bodyText} linkColor={skin.colors.accent} />
        </View>
      ) : null}

      {!hasContent && emptyHint ? <Text style={styles.emptyHint}>{emptyHint}</Text> : null}

      {profile.interests.length > 0 ? (
        <Section title="Interests" titleStyle={titleStyle}>
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
        <Section title="Specialties" titleStyle={titleStyle}>
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
        <Section title="Certifications" titleStyle={titleStyle}>
          {profile.certifications.map((c) => (
            <Text key={c} style={styles.bodyText}>
              • {c}
            </Text>
          ))}
        </Section>
      ) : null}

      {services.length + privates.length > 0 ? (
        // Tabs on wide screens, accordions on phones, on a tinted band.
        <View style={[styles.band, { backgroundColor: skin.colors.band }]}>
          {[
            { title: "Services", items: services },
            { title: "Private sessions", items: privates },
          ]
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <Section key={group.title} title={group.title} titleStyle={titleStyle}>
                <TabsOrAccordion
                  accentColor={skin.colors.accent}
                  titleStyle={headingFont}
                  items={group.items.map((item) => ({
                    key: item.id,
                    title: item.title,
                    content: item.description ? <Text style={styles.bodyText}>{item.description}</Text> : null,
                  }))}
                />
              </Section>
            ))}
        </View>
      ) : null}

      {testimonials.length > 0 ? (
        <TestimonialsSection
          testimonials={testimonials}
          background={imageSource(profile.testimonials_background_url)}
          skin={skin}
          headingFont={headingFont}
        />
      ) : null}

      {gallery.length > 0 ? (
        <Section title="Gallery" titleStyle={titleStyle}>
          <View style={styles.galleryRow}>
            {gallery.map(({ id, source }) => (
              <Image key={id} source={source} style={styles.galleryImage} />
            ))}
          </View>
        </Section>
      ) : null}

      {website ? (
        <WebsiteFooter profile={profile} skin={skin} />
      ) : hasContact ? (
        <Section title="Contact" titleStyle={titleStyle} style={styles.contactSection}>
          {profile.contact_email ? (
            <Text style={styles.bodyText} onPress={() => Linking.openURL(`mailto:${profile.contact_email}`)}>
              {profile.contact_email}
            </Text>
          ) : null}
          {profile.contact_phone ? <Text style={styles.bodyText}>{profile.contact_phone}</Text> : null}
          {profile.instagram_handle ? <Text style={styles.bodyText}>{profile.instagram_handle}</Text> : null}
        </Section>
      ) : null}
    </ParallaxScrollView>
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
  container: { paddingBottom: 40, paddingTop: 8 },
  // The footer sits flush with the bottom.
  websiteContainer: { paddingTop: 0 },
  band: { paddingVertical: 8, marginVertical: 8 },
  header: { alignItems: "center", paddingVertical: 24 },
  logo: { width: 220, height: 80 },
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  card: { marginHorizontal: 20, borderRadius: 10, padding: 18 },
  headshot: { width: 140, height: 140, borderRadius: 70, alignSelf: "center", marginBottom: 12 },
  name: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  bioShort: { textAlign: "center", marginTop: 6, fontSize: 14, color: "#555" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  bodyText: { fontSize: 14, lineHeight: 20, color: "#333" },
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
