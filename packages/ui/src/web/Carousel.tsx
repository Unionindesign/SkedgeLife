"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./ui.module.css";

type Props<T> = {
  items: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  autoPlayMs?: number;
  dotColor?: string;
  inactiveDotColor?: string;
  label: string;
};

// The web version of Carousel (see ../Carousel.tsx): swipeable slides with
// dots, using CSS scroll snapping. Every slide is in the page's HTML, so
// search engines read them all. Autoplay waits a full turn after any tap or
// swipe, pauses on hover or keyboard focus, and is off with "reduce motion".
export function Carousel<T>({
  items,
  keyOf,
  renderItem,
  autoPlayMs,
  dotColor = "#fff",
  inactiveDotColor = "rgba(255,255,255,0.45)",
  label,
}: Props<T>) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (next: number) => {
    const el = track.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setIndex(next);
  };

  useEffect(() => {
    if (!autoPlayMs || paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => goTo((index + 1) % items.length), autoPlayMs);
    return () => clearTimeout(timer);
  }, [autoPlayMs, paused, items.length, index]);

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={track}
        className={styles.carouselTrack}
        onScroll={(e) => {
          const el = e.currentTarget;
          const current = Math.round(el.scrollLeft / el.clientWidth);
          if (current !== index) setIndex(current);
        }}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {items.map((item, i) => (
          <div
            key={keyOf(item)}
            className={styles.carouselSlide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
          >
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {items.length > 1 ? (
        <div className={styles.carouselDots}>
          {items.map((item, i) => (
            <button
              key={keyOf(item)}
              type="button"
              className={styles.carouselDot}
              style={{ background: i === index ? dotColor : inactiveDotColor }}
              onClick={() => goTo(i)}
              aria-label={`Show ${i + 1} of ${items.length}`}
              aria-current={i === index}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
