"use client";

import React, { useEffect, useRef } from "react";
import { parallaxOffset } from "../shared/logic";
import styles from "./ui.module.css";

// The web version of ParallaxSection (see ../Parallax.tsx): a band whose
// background photo moves more slowly than the page as it scrolls. Moved with
// a transform, since iPhones ignore CSS `background-attachment: fixed`; still
// with "reduce motion" on. Renders on the server as a plain background, and
// starts moving once the page is interactive.
export function ParallaxSection({
  image,
  speed = 0.4,
  overlayColor,
  minHeight = 360,
  className,
  children,
  ...rest
}: {
  image: string;
  speed?: number;
  overlayColor?: string;
  minHeight?: number;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "children">) {
  const section = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!section.current || !layer.current) return;
      const rect = section.current.getBoundingClientRect();
      const { travel, translateY } = parallaxOffset(window.innerHeight, rect.top, rect.height, speed);
      layer.current.style.height = `${rect.height + travel}px`;
      layer.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <section
      ref={section}
      className={[styles.parallax, className].filter(Boolean).join(" ")}
      style={{ minHeight }}
      {...rest}
    >
      <div ref={layer} className={styles.parallaxLayer} style={{ backgroundImage: `url("${image}")` }} aria-hidden />
      {overlayColor ? (
        <div className={styles.parallaxOverlay} style={{ background: overlayColor }} aria-hidden />
      ) : null}
      <div className={styles.parallaxContent}>{children}</div>
    </section>
  );
}
