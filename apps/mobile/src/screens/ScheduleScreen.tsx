import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from "react-native";
import { getSkin } from "@skedgelife/skins";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ScheduleScreen() {
  const { state, reload } = useProfile();
  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;

  const { schedule_entries: entries } = state.profile;
  const skin = getSkin(state.profile.skin);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No public classes available at this time.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {entries.map((entry) => (
        <View key={entry.id} style={[styles.card, { borderColor: skin.colors.accent }]}>
          <Text style={styles.venueName}>{entry.venue_name}</Text>
          {entry.schedule_times.map((t) => (
            <Text key={t.id} style={styles.timeLine}>
              <Text style={styles.day}>{DAY_NAMES[t.day_of_week]}: </Text>
              {t.label}
            </Text>
          ))}
          {entry.booking_url ? (
            <Pressable onPress={() => Linking.openURL(entry.booking_url!)}>
              <Text style={[styles.link, { color: skin.colors.accent }]}>View studio →</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: { borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 16 },
  venueName: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  timeLine: { fontSize: 14, marginBottom: 4, color: "#333" },
  day: { fontWeight: "600" },
  link: { marginTop: 8, fontWeight: "600" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  emptyText: { fontSize: 15, color: "#666", textAlign: "center" },
});
