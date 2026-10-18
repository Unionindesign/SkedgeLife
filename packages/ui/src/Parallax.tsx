import React, { createContext, useContext, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useReducedMotion } from "./useReducedMotion";

// Parallax backgrounds for any screen, on the phone and on the web.
//
// - <ParallaxScrollView backdrop={image}> puts a background behind a whole
//   screen that drifts more slowly than the content as it scrolls.
// - <ParallaxSection image={image}> is a band inside a ParallaxScrollView with
//   its own slower-moving background (the testimonials section, for example).
//
// Both move the image with a transform driven by the scroll position, which
// works everywhere (CSS `background-attachment: fixed` doesn't on iPhones).
// Speed runs from 0 (the image stays put on screen) to 1 (it scrolls with the
// content). With "reduce motion" on, backgrounds don't move.

type ParallaxContextValue = {
  scrollY: Animated.Value;
  viewportHeight: number;
  content: React.RefObject<View | null>;
};

const ParallaxContext = createContext<ParallaxContextValue | null>(null);

// The web build has no native animation driver.
const USE_NATIVE_DRIVER = Platform.OS !== "web";

function Backdrop({ image, overlayColor }: { image: ImageSourcePropType; overlayColor?: string }) {
  return (
    <>
      <Image source={image} style={styles.fill} resizeMode="cover" />
      {overlayColor ? <View style={[styles.fill, { backgroundColor: overlayColor }]} /> : null}
    </>
  );
}

type ParallaxScrollViewProps = ScrollViewProps & {
  // A background for the whole screen.
  backdrop?: ImageSourcePropType;
  backdropSpeed?: number;
  // A color laid over the backdrop to keep text readable, e.g. "rgba(255,255,255,0.7)".
  backdropOverlay?: string;
  children: React.ReactNode;
};

export function ParallaxScrollView({
  backdrop,
  backdropSpeed = 0.3,
  backdropOverlay,
  style,
  onScroll,
  onContentSizeChange,
  children,
  ...scrollProps
}: ParallaxScrollViewProps) {
  // Kept in state, not a ref, so it can be read while rendering.
  const [scrollY] = useState(() => new Animated.Value(0));
  const content = useRef<View>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const reduced = useReducedMotion();

  // The backdrop is taller than the screen by exactly how far it moves, so it
  // always covers the screen from the top of the content to the bottom.
  const scrollRange = Math.max(0, contentHeight - viewportHeight);
  const travel = reduced ? 0 : scrollRange * backdropSpeed;
  const translateY =
    travel > 0
      ? scrollY.interpolate({ inputRange: [0, scrollRange], outputRange: [0, -travel], extrapolate: "clamp" })
      : 0;

  return (
    <View style={[styles.container, style]} onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}>
      {backdrop && viewportHeight > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.layer, { height: viewportHeight + travel, transform: [{ translateY }] }]}
        >
          <Backdrop image={backdrop} overlayColor={backdropOverlay} />
        </Animated.View>
      ) : null}
      <ParallaxContext.Provider value={{ scrollY, viewportHeight, content }}>
        <Animated.ScrollView
          {...scrollProps}
          style={styles.scroll}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: USE_NATIVE_DRIVER,
            listener: onScroll,
          })}
          onContentSizeChange={(w, h) => {
            setContentHeight(h);
            onContentSizeChange?.(w, h);
          }}
        >
          <View ref={content} collapsable={false}>
            {children}
          </View>
        </Animated.ScrollView>
      </ParallaxContext.Provider>
    </View>
  );
}

type ParallaxSectionProps = {
  image: ImageSourcePropType;
  speed?: number;
  overlayColor?: string;
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

// Outside a ParallaxScrollView it still works, with a background that doesn't move.
export function ParallaxSection({ image, speed = 0.4, overlayColor, minHeight = 360, style, children }: ParallaxSectionProps) {
  const parallax = useContext(ParallaxContext);
  const section = useRef<View>(null);
  const [top, setTop] = useState<number | null>(null);
  const [height, setHeight] = useState(minHeight);
  const reduced = useReducedMotion();

  const onLayout = (e: LayoutChangeEvent) => {
    setHeight(e.nativeEvent.layout.height);
    // Where the section starts within the scrolling content, however deeply it's nested.
    if (parallax?.content.current && section.current) {
      section.current.measureLayout(parallax.content.current, (_x, y) => setTop(y), () => setTop(null));
    }
  };

  // While the section crosses the screen (its top entering at the bottom,
  // until its bottom leaves at the top), the image slides down by `travel`
  // inside it, so it appears to move up more slowly than the content.
  const viewport = parallax?.viewportHeight ?? 0;
  const travel = !parallax || top === null || reduced || viewport === 0 ? 0 : (viewport + height) * speed;
  const translateY =
    travel > 0 && parallax && top !== null
      ? parallax.scrollY.interpolate({
          inputRange: [top - viewport, top + height],
          outputRange: [-travel, 0],
          extrapolate: "clamp",
        })
      : 0;

  return (
    <View ref={section} collapsable={false} onLayout={onLayout} style={[styles.section, { minHeight }, style]}>
      <Animated.View pointerEvents="none" style={[styles.layer, { height: height + travel, transform: [{ translateY }] }]}>
        <Backdrop image={image} overlayColor={overlayColor} />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  scroll: { flex: 1, backgroundColor: "transparent" },
  layer: { position: "absolute", top: 0, left: 0, right: 0 },
  fill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  section: { overflow: "hidden", justifyContent: "center" },
});
