import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OccurrenceWithEvent } from "@skedgelife/data";
import { skinFor } from "@skedgelife/skins";
import type { MainStackParamList } from "../navigation/RootNavigator";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import Chips from "../components/Chips";
import ListView from "./schedule/ListView";
import CalendarView from "./schedule/CalendarView";

type ScheduleView = "list" | "week" | "month";
const VIEW_KEY = "schedule.view";

// The signed-in host's schedule as a list of upcoming dates, a week, or a
// month. Tap a date to edit it (or every date of its event).
export default function ScheduleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { state, reload } = useProfile();
  const [view, setView] = useState<ScheduleView>("list");

  // Remember the last view; storage failing just means starting on the list.
  useEffect(() => {
    AsyncStorage.getItem(VIEW_KEY)
      .then((saved) => {
        if (saved === "list" || saved === "week" || saved === "month") setView(saved);
      })
      .catch(() => {});
  }, []);
  const choose = (next: ScheduleView) => {
    setView(next);
    AsyncStorage.setItem(VIEW_KEY, next).catch(() => {});
  };

  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;

  const accent = skinFor(state.profile).colors.accent;
  const open = (item: OccurrenceWithEvent) =>
    navigation.navigate("EventForm", { eventId: item.event.id, occurrenceId: item.id });
  const add = () => navigation.navigate("EventForm", {});

  return (
    <View style={styles.container}>
      <View style={styles.switcher}>
        <Chips
          options={[
            { value: "list", label: "List" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
          selected={view}
          onToggle={choose}
          accentColor={accent}
        />
      </View>
      {view === "list" ? (
        <ListView profileId={state.profile.id} accent={accent} onOpen={open} onAdd={add} />
      ) : (
        <CalendarView key={view} mode={view} profileId={state.profile.id} accent={accent} onOpen={open} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  switcher: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e4e4e4",
  },
});
