import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ProfilePage } from "@skedgelife/data";
import type { Skin } from "@skedgelife/skins";

// The website's dark footer: name, contact links, and a copyright line, in
// the skin's footer color.
export default function WebsiteFooter({ profile, skin }: { profile: ProfilePage; skin: Skin }) {
  const color = skin.colors.footerText;
  const nameFont = skin.fonts.accent
    ? { fontFamily: skin.fonts.accent, fontWeight: "normal" as const, fontSize: 30 }
    : null;
  const instagram = profile.instagram_handle?.replace(/^@/, "");
  const links = [
    profile.contact_email
      ? { icon: "mail-outline" as const, label: profile.contact_email, url: `mailto:${profile.contact_email}` }
      : null,
    profile.contact_phone
      ? {
          icon: "call-outline" as const,
          label: profile.contact_phone,
          url: `tel:${profile.contact_phone.replace(/[^0-9+]/g, "")}`,
        }
      : null,
    instagram
      ? { icon: "logo-instagram" as const, label: `@${instagram}`, url: `https://instagram.com/${instagram}` }
      : null,
  ].filter((l) => l !== null);

  return (
    <View style={[styles.footer, { backgroundColor: skin.colors.footer }]}>
      <Text style={[styles.name, { color }, nameFont]}>{profile.display_name}</Text>
      {profile.bio_short ? <Text style={[styles.tagline, { color }]}>{profile.bio_short}</Text> : null}
      {links.length > 0 ? (
        <View style={styles.links}>
          {links.map((link) => (
            <Pressable
              key={link.url}
              style={styles.link}
              onPress={() => Linking.openURL(link.url)}
              accessibilityRole="link"
            >
              <Ionicons name={link.icon} size={18} color={color} />
              <Text style={[styles.linkText, { color }]}>{link.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={[styles.rule, { backgroundColor: color }]} />
      <Text style={[styles.small, { color }]}>
        © {new Date().getFullYear()} {profile.display_name} · Made with SkedgeLife
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: 24, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, alignItems: "center" },
  name: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  tagline: { fontSize: 13, textAlign: "center", marginTop: 6, opacity: 0.85, maxWidth: 520 },
  links: { marginTop: 20, gap: 12, alignItems: "flex-start" },
  link: { flexDirection: "row", alignItems: "center", gap: 10 },
  linkText: { fontSize: 15 },
  rule: { height: StyleSheet.hairlineWidth, alignSelf: "stretch", opacity: 0.4, marginTop: 24, marginBottom: 14 },
  small: { fontSize: 12, opacity: 0.75, textAlign: "center" },
});
