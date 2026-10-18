import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useReducedMotion } from "./useReducedMotion";

type Props<T> = {
  items: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  // Moves to the next slide every this many milliseconds; off when omitted,
  // while the person is swiping, and with "reduce motion" on.
  autoPlayMs?: number;
  dotColor?: string;
  inactiveDotColor?: string;
  style?: StyleProp<ViewStyle>;
};

// Swipeable slides, one at a time, with dots underneath. Works on the phone
// and on the web.
export function Carousel<T>({
  items,
  keyOf,
  renderItem,
  autoPlayMs,
  dotColor = "#fff",
  inactiveDotColor = "rgba(255,255,255,0.45)",
  style,
}: Props<T>) {
  const scroller = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [touching, setTouching] = useState(false);
  const reduced = useReducedMotion();

  const goTo = (next: number) => {
    scroller.current?.scrollTo({ x: next * width, animated: !reduced });
    setIndex(next);
  };

  // The countdown restarts on every slide change, so a tap or swipe gets a full
  // turn before autoplay moves on.
  useEffect(() => {
    if (!autoPlayMs || reduced || touching || items.length < 2 || width === 0) return;
    const timer = setTimeout(() => goTo((index + 1) % items.length), autoPlayMs);
    return () => clearTimeout(timer);
  }, [autoPlayMs, reduced, touching, items.length, width, index]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={style} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={32}
          onScroll={(e) => {
            const current = Math.round(e.nativeEvent.contentOffset.x / width);
            if (current !== index && current >= 0 && current < items.length) setIndex(current);
          }}
          onScrollBeginDrag={() => setTouching(true)}
          onScrollEndDrag={() => setTouching(false)}
        >
          {items.map((item, i) => (
            <View key={keyOf(item)} style={{ width }}>
              {renderItem(item, i)}
            </View>
          ))}
        </ScrollView>
      ) : null}
      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, i) => (
            <Pressable
              key={keyOf(item)}
              onPress={() => goTo(i)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Slide ${i + 1} of ${items.length}`}
              accessibilityState={{ selected: i === index }}
            >
              <View style={[styles.dot, { backgroundColor: i === index ? dotColor : inactiveDotColor }]} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
