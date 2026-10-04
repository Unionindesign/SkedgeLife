import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { galleryLimit } from "@skedgelife/data";
import { getSkin } from "@skedgelife/skins";
import type { MainStackParamList, TabParamList } from "../../navigation/RootNavigator";
import { useProfile } from "../../data/ProfileProvider";
import ProfileStatus from "../../components/ProfileStatus";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Website">,
  NativeStackScreenProps<MainStackParamList>
>;

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// Manage the website's content. The visual website builder comes later.
export default function WebsiteScreen({ navigation }: Props) {
  const { state, reload } = useProfile();
  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;
  const profile = state.profile;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.address}>skedgelife.com/{profile.handle}</Text>
        <Text style={styles.note}>Public pages are coming soon. Until then, preview your page here.</Text>
        <Pressable style={styles.previewButton} onPress={() => navigation.navigate("WebsitePreview")}>
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text style={styles.previewText}>Preview</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>Content</Text>
      <Row
        icon="color-palette-outline"
        title="Look"
        detail={`${getSkin(profile.skin).label} skin · ${profile.logo_url ? "logo added" : "no logo"}`}
        onPress={() => navigation.navigate("Look")}
      />
      {profile.teaches ? (
        <>
          <Row
            icon="sparkles-outline"
            title="Services"
            detail={count(profile.service_modalities.length, "service")}
            onPress={() => navigation.navigate("ContentList", { kind: "services" })}
          />
          <Row
            icon="person-outline"
            title="Private sessions"
            detail={count(profile.private_session_types.length, "session")}
            onPress={() => navigation.navigate("ContentList", { kind: "privates" })}
          />
        </>
      ) : null}
      <Row
        icon="chatbubble-ellipses-outline"
        title="Testimonials"
        detail={count(profile.testimonials.length, "testimonial")}
        onPress={() => navigation.navigate("ContentList", { kind: "testimonials" })}
      />
      <Row
        icon="images-outline"
        title="Gallery"
        detail={`${profile.gallery_images.length} of ${galleryLimit(profile.plan)} photos`}
        onPress={() => navigation.navigate("Gallery")}
      />
      {!profile.teaches ? (
        <Text style={styles.hint}>Turn on "I teach classes or sessions" in Edit profile to add services and private sessions.</Text>
      ) : null}
    </ScrollView>
  );
}

function Row({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#2f2f2f" />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#aaa" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40, backgroundColor: "#fff", flexGrow: 1 },
  card: { margin: 20, padding: 18, borderRadius: 12, backgroundColor: "#f4f4f2" },
  address: { fontSize: 17, fontWeight: "700", color: "#2f2f2f" },
  note: { fontSize: 13, color: "#666", marginTop: 6, lineHeight: 18 },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 14,
    backgroundColor: "#2f2f2f",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  previewText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  heading: { fontSize: 13, fontWeight: "600", color: "#888", textTransform: "uppercase", marginHorizontal: 20, marginBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, color: "#2f2f2f" },
  rowDetail: { fontSize: 13, color: "#888", marginTop: 2 },
  hint: { fontSize: 13, color: "#777", marginHorizontal: 20, marginTop: 14, lineHeight: 18 },
});
