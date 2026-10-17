import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  WEEKDAYS_SHORT,
  addDaysToDate,
  addMonths,
  daysBetween,
  deviceTimeZone,
  formatDate,
  formatMonth,
  formatWeekRange,
  getOccurrencesBetween,
  localToUtcIso,
  startOfMonth,
  startOfWeek,
  todayIn,
  type OccurrenceWithEvent,
} from "@skedgelife/data";
import { supabase } from "../../lib/supabase";
import OccurrenceRow, { dayOf, isCancelled } from "./OccurrenceRow";
import { scheduleStyles } from "./styles";
import { useFocusedLoad } from "./useFocusedLoad";

// Weekly events have dates generated this far ahead (sync_event_occurrences).
const WEEKLY_HORIZON_DAYS = 84;

// A week or month of the host's dates, past ones included. Days follow the
// phone's calendar; each date sits on the day it happens where it happens.
export default function CalendarView({
  mode,
  profileId,
  accent,
  onOpen,
}: {
  mode: "week" | "month";
  profileId: string;
  accent: string;
  onOpen: (item: OccurrenceWithEvent) => void;
}) {
  const today = todayIn(deviceTimeZone());
  // Any day inside the week or month on screen.
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState(today);
  const [refreshing, setRefreshing] = useState(false);

  const monthStart = startOfMonth(anchor);
  const gridStart = mode === "week" ? startOfWeek(anchor) : startOfWeek(monthStart);
  const gridDays =
    mode === "week" ? 7 : Math.ceil((daysBetween(gridStart, monthStart) + daysBetween(monthStart, addMonths(monthStart, 1))) / 7) * 7;
  const gridEnd = addDaysToDate(gridStart, gridDays);
  const days = useMemo(() => Array.from({ length: gridDays }, (_, i) => addDaysToDate(gridStart, i)), [gridStart, gridDays]);

  // A day either side, since an event's own zone can put it on a different day than the phone's.
  const device = deviceTimeZone();
  const from = localToUtcIso(addDaysToDate(gridStart, -1), "00:00", device);
  const to = localToUtcIso(addDaysToDate(gridEnd, 1), "00:00", device);
  const { state, reload } = useFocusedLoad(() => getOccurrencesBetween(supabase, profileId, from, to), `${profileId}:${from}`);

  const byDay = useMemo(() => {
    const map = new Map<string, OccurrenceWithEvent[]>();
    if (state.status === "ready") {
      for (const item of state.data) {
        const day = dayOf(item);
        map.set(day, [...(map.get(day) ?? []), item]);
      }
    }
    return map;
  }, [state]);

  const move = (step: number) => {
    if (mode === "week") {
      const next = addDaysToDate(anchor, step * 7);
      setAnchor(next);
      setSelected(next);
    } else {
      const next = addMonths(monthStart, step);
      setAnchor(next);
      setSelected(next.slice(0, 7) === today.slice(0, 7) ? today : next);
    }
  };
  const goToday = () => {
    setAnchor(today);
    setSelected(today);
  };
  const refresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const label = mode === "week" ? formatWeekRange(gridStart) : formatMonth(monthStart);
  const showingToday = mode === "week" ? days.includes(today) : monthStart === startOfMonth(today);
  const pastHorizon = daysBetween(today, gridEnd) > WEEKLY_HORIZON_DAYS;

  const rowsFor = (day: string, emptyText: string) => {
    const items = byDay.get(day) ?? [];
    if (items.length === 0) return <Text style={styles.nothing}>{emptyText}</Text>;
    return items.map((item) => <OccurrenceRow key={item.id} item={item} accent={accent} onPress={() => onOpen(item)} />);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => move(-1)} hitSlop={10} accessibilityLabel={mode === "week" ? "Previous week" : "Previous month"}>
          <Ionicons name="chevron-back" size={22} color="#2f2f2f" />
        </Pressable>
        <Text style={styles.label}>{label}</Text>
        <Pressable onPress={() => move(1)} hitSlop={10} accessibilityLabel={mode === "week" ? "Next week" : "Next month"}>
          <Ionicons name="chevron-forward" size={22} color="#2f2f2f" />
        </Pressable>
        <View style={{ flex: 1 }} />
        {state.status === "loading" ? <ActivityIndicator size="small" /> : null}
        {!showingToday ? (
          <Pressable onPress={goToday} style={styles.todayButton}>
            <Text style={styles.todayText}>Today</Text>
          </Pressable>
        ) : null}
      </View>

      {state.status === "error" ? (
        <View style={scheduleStyles.emptyState}>
          <Text style={scheduleStyles.emptyText}>Couldn't load your schedule.</Text>
          <Text style={scheduleStyles.errorDetail}>{state.message}</Text>
          <Pressable style={scheduleStyles.outlineButton} onPress={reload}>
            <Text style={scheduleStyles.outlineText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
          {mode === "month" ? (
            <>
              <View style={styles.weekdays}>
                {WEEKDAYS_SHORT.map((d) => (
                  <Text key={d} style={styles.weekday}>
                    {d.slice(0, 1)}
                  </Text>
                ))}
              </View>
              <View style={styles.grid}>
                {days.map((day) => {
                  const items = byDay.get(day) ?? [];
                  const inMonth = day.slice(0, 7) === monthStart.slice(0, 7);
                  const isSelected = day === selected;
                  return (
                    <Pressable
                      key={day}
                      style={[styles.cell, !inMonth && styles.outside]}
                      onPress={() => setSelected(day)}
                      accessibilityLabel={`${formatDate(day, "long")}, ${items.length} ${items.length === 1 ? "event" : "events"}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View
                        style={[
                          styles.dayNumber,
                          day === today && { borderColor: accent, borderWidth: 1.5 },
                          isSelected && { backgroundColor: accent, borderColor: accent },
                        ]}
                      >
                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{Number(day.slice(8))}</Text>
                      </View>
                      <View style={styles.dots}>
                        {items.slice(0, 3).map((item) => (
                          <View key={item.id} style={[styles.dot, { backgroundColor: isCancelled(item) ? "#ccc" : accent }]} />
                        ))}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={scheduleStyles.dayHeading}>{selected === today ? "Today" : formatDate(selected, "long")}</Text>
              {rowsFor(selected, "Nothing on this day.")}
            </>
          ) : (
            days.map((day) => {
              const heading = (
                <Text style={[scheduleStyles.dayHeading, day === today && { color: accent }]}>
                  {formatDate(day, "long")}
                  {day === today ? " · Today" : ""}
                </Text>
              );
              // Empty days take one line, so a quiet week still fits on screen.
              if (!byDay.has(day)) {
                return (
                  <View key={day} style={styles.emptyDay}>
                    {heading}
                    <Text style={styles.emptyDayText}>Nothing scheduled</Text>
                  </View>
                );
              }
              return (
                <View key={day}>
                  {heading}
                  {rowsFor(day, "")}
                </View>
              );
            })
          )}
          {pastHorizon ? <Text style={styles.horizon}>Weekly classes show up to 12 weeks ahead.</Text> : null}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 10 },
  label: { fontSize: 16, fontWeight: "700", color: "#2f2f2f" },
  todayButton: { borderWidth: 1, borderColor: "#2f2f2f", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4 },
  todayText: { fontSize: 13, fontWeight: "600", color: "#2f2f2f" },
  weekdays: { flexDirection: "row", paddingHorizontal: 12 },
  weekday: { flex: 1, textAlign: "center", fontSize: 12, color: "#888", paddingVertical: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12 },
  cell: { width: `${100 / 7}%`, alignItems: "center", paddingVertical: 4, height: 52 },
  outside: { opacity: 0.35 },
  dayNumber: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "transparent" },
  dayText: { fontSize: 15, color: "#2f2f2f" },
  dayTextSelected: { color: "#fff", fontWeight: "700" },
  dots: { flexDirection: "row", gap: 3, marginTop: 3, height: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  emptyDay: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingRight: 20 },
  emptyDayText: { fontSize: 13, color: "#aaa" },
  nothing: { paddingHorizontal: 20, paddingVertical: 10, fontSize: 14, color: "#999" },
  horizon: { paddingHorizontal: 20, paddingTop: 16, fontSize: 12, color: "#999" },
});
