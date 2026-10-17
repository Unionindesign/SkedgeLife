import React, { useState } from "react";
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import {
  addDaysToDate,
  dateDetails,
  displayTimeZone,
  formatDate,
  getUpcomingOccurrences,
  todayIn,
  type OccurrenceWithEvent,
} from "@skedgelife/data";
import ProfileStatus from "../../components/ProfileStatus";
import { supabase } from "../../lib/supabase";
import OccurrenceRow, { dayOf } from "./OccurrenceRow";
import { scheduleStyles } from "./styles";
import { useFocusedLoad } from "./useFocusedLoad";

type Section = { title: string; data: OccurrenceWithEvent[] };

// Groups dates under day headings, each in the zone its times are shown in.
function toSections(items: OccurrenceWithEvent[]): Section[] {
  const sections: Section[] = [];
  for (const item of items) {
    const day = dayOf(item);
    const today = todayIn(displayTimeZone(dateDetails(item)));
    const title = day === today ? "Today" : day === addDaysToDate(today, 1) ? "Tomorrow" : formatDate(day, "long");
    const last = sections[sections.length - 1];
    if (last?.title === title) last.data.push(item);
    else sections.push({ title, data: [item] });
  }
  return sections;
}

// Every upcoming date, soonest first.
export default function ListView({
  profileId,
  accent,
  onOpen,
  onAdd,
}: {
  profileId: string;
  accent: string;
  onOpen: (item: OccurrenceWithEvent) => void;
  onAdd: () => void;
}) {
  const { state, reload } = useFocusedLoad(() => getUpcomingOccurrences(supabase, profileId), profileId);
  const [refreshing, setRefreshing] = useState(false);

  if (state.status === "loading") return <ProfileStatus status="loading" />;
  if (state.status === "error") {
    return (
      <View style={scheduleStyles.emptyState}>
        <Text style={scheduleStyles.emptyText}>Couldn't load your schedule.</Text>
        <Text style={scheduleStyles.errorDetail}>{state.message}</Text>
        <Pressable style={scheduleStyles.outlineButton} onPress={reload}>
          <Text style={scheduleStyles.outlineText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
  if (state.data.length === 0) {
    return (
      <View style={scheduleStyles.emptyState}>
        <Text style={scheduleStyles.emptyText}>No scheduled classes or upcoming events.</Text>
        <Pressable style={scheduleStyles.outlineButton} onPress={onAdd}>
          <Text style={scheduleStyles.outlineText}>Add an event</Text>
        </Pressable>
      </View>
    );
  }

  const refresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <SectionList
      style={styles.list}
      sections={toSections(state.data)}
      keyExtractor={(o) => o.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      renderSectionHeader={({ section }) => <Text style={scheduleStyles.dayHeading}>{section.title}</Text>}
      stickySectionHeadersEnabled={false}
      renderItem={({ item }) => <OccurrenceRow item={item} accent={accent} onPress={() => onOpen(item)} />}
      ListFooterComponent={
        <Pressable style={[scheduleStyles.outlineButton, styles.footerButton]} onPress={onAdd}>
          <Text style={scheduleStyles.outlineText}>Add an event</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: "#fff" },
  footerButton: { marginHorizontal: 20, marginBottom: 32 },
});
