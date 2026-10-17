import React, { useCallback, useState } from "react";
import { Linking, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  dateDetails,
  deviceTimeZone,
  displayTimeZone,
  formatDate,
  formatTime,
  getUpcomingOccurrences,
  sameWallClock,
  todayIn,
  utcToLocal,
  addDaysToDate,
  zoneLabel,
  type DateDetails,
  type OccurrenceWithEvent,
} from "@skedgelife/data";
import { getSkin } from "@skedgelife/skins";
import type { MainStackParamList } from "../navigation/RootNavigator";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/errors";

type Upcoming = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; items: OccurrenceWithEvent[] };
type Section = { title: string; data: OccurrenceWithEvent[] };

// Groups dates under day headings, each in the zone its times are shown in.
function toSections(items: OccurrenceWithEvent[]): Section[] {
  const sections: Section[] = [];
  for (const item of items) {
    const zone = displayTimeZone(dateDetails(item));
    const day = utcToLocal(item.starts_at, zone).date;
    const today = todayIn(zone);
    const title = day === today ? "Today" : day === addDaysToDate(today, 1) ? "Tomorrow" : formatDate(day, "long");
    const last = sections[sections.length - 1];
    if (last?.title === title) last.data.push(item);
    else sections.push({ title, data: [item] });
  }
  return sections;
}

function placeLabel(d: DateDetails) {
  if (d.format === "online") return "Online";
  if (d.is_private_home) return `${d.venue?.name ?? d.area ?? "Private home"} · private home`;
  return d.venue?.name ?? "";
}

// The signed-in host's upcoming dates. Tap one to edit it or cancel that date.
export default function ScheduleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { state, reload } = useProfile();
  const profileId = state.status === "ready" ? state.profile.id : null;
  const [upcoming, setUpcoming] = useState<Upcoming>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profileId) return;
    try {
      setUpcoming({ status: "ready", items: await getUpcomingOccurrences(supabase, profileId) });
    } catch (err) {
      setUpcoming({ status: "error", message: errorMessage(err) });
    }
  }, [profileId]);

  // Reload whenever the tab comes back into view, e.g. after saving an event.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;
  if (upcoming.status === "loading") return <ProfileStatus status="loading" />;
  if (upcoming.status === "error") {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Couldn't load your schedule.</Text>
        <Text style={styles.errorDetail}>{upcoming.message}</Text>
        <Pressable style={styles.outlineButton} onPress={load}>
          <Text style={styles.outlineText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const accent = getSkin(state.profile.skin).colors.accent;
  const device = deviceTimeZone();
  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };
  const addEvent = () => navigation.navigate("EventForm", {});

  if (upcoming.items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No scheduled classes or upcoming events.</Text>
        <Pressable style={styles.outlineButton} onPress={addEvent}>
          <Text style={styles.outlineText}>Add an event</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SectionList
      style={styles.list}
      sections={toSections(upcoming.items)}
      keyExtractor={(o) => o.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      renderSectionHeader={({ section }) => <Text style={styles.dayHeading}>{section.title}</Text>}
      stickySectionHeadersEnabled={false}
      renderItem={({ item }) => {
        const { event } = item;
        // The date's own changes (if any) over its event's details.
        const d = dateDetails(item);
        const zone = displayTimeZone(d);
        const cancelled = item.status === "cancelled" || event.status === "cancelled";
        const zoneSuffix = sameWallClock(item.starts_at, zone, device) ? "" : ` ${zoneLabel(item.starts_at, zone)}`;
        return (
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate("EventForm", { eventId: event.id, occurrenceId: item.id })
            }
          >
            <View style={[styles.timeCol, { borderColor: accent }]}>
              <Text style={[styles.time, cancelled && styles.struck]}>{formatTime(item.starts_at, zone)}</Text>
              <Text style={styles.timeEnd}>
                {formatTime(item.ends_at, zone)}
                {zoneSuffix}
              </Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.title, cancelled && styles.struck]}>{d.title}</Text>
              <Text style={styles.place} numberOfLines={1}>
                {cancelled ? "Cancelled · " : item.is_modified ? "Changed · " : ""}
                {placeLabel(d)}
                {event.weekly_days ? " · Weekly" : ""}
              </Text>
            </View>
            {!cancelled && d.booking_mode === "external_link" && d.booking_url ? (
              <Pressable onPress={() => Linking.openURL(d.booking_url!)} hitSlop={8}>
                <Text style={[styles.book, { color: accent }]}>Book →</Text>
              </Pressable>
            ) : null}
          </Pressable>
        );
      }}
      ListFooterComponent={
        <Pressable style={[styles.outlineButton, styles.footerButton]} onPress={addEvent}>
          <Text style={styles.outlineText}>Add an event</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: "#fff" },
  dayHeading: { fontSize: 15, fontWeight: "700", color: "#2f2f2f", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e4e4e4",
  },
  timeCol: { width: 100, borderLeftWidth: 3, paddingLeft: 8 },
  time: { fontSize: 15, fontWeight: "600", color: "#2f2f2f" },
  timeEnd: { fontSize: 12, color: "#777", marginTop: 2 },
  details: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#2f2f2f" },
  place: { fontSize: 13, color: "#666", marginTop: 2 },
  struck: { textDecorationLine: "line-through", color: "#999" },
  book: { fontSize: 14, fontWeight: "600" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  emptyText: { fontSize: 16, color: "#888", textAlign: "center" },
  errorDetail: { fontSize: 13, color: "#999", textAlign: "center", marginTop: 6 },
  outlineButton: { marginTop: 16, borderWidth: 1, borderColor: "#2f2f2f", borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, alignItems: "center" },
  footerButton: { marginHorizontal: 20, marginBottom: 32 },
  outlineText: { fontSize: 15, fontWeight: "600", color: "#2f2f2f" },
});
