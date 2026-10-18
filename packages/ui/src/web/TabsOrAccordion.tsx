"use client";

import React, { useState } from "react";
import styles from "./ui.module.css";

export type DisclosureItem = { key: string; title: string; content: React.ReactNode };

// The web version of TabsOrAccordion (see ../Disclosure.tsx): tabs on wide
// screens, an accordion on phones. Each item's content is in the HTML once,
// and CSS (at WIDE_SCREEN, 768px) decides which control shows, so the server
// render needs no screen size and search engines see every item.
export function TabsOrAccordion({
  items,
  accentColor,
  titleStyle,
  label,
}: {
  items: DisclosureItem[];
  accentColor: string;
  titleStyle?: React.CSSProperties;
  label: string;
}) {
  const [tab, setTab] = useState(items[0]?.key);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className={styles.disclosure} style={{ "--accent": accentColor } as React.CSSProperties}>
      <div className={styles.tabList} role="tablist" aria-label={label}>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            id={`tab-${item.key}`}
            aria-selected={item.key === tab}
            aria-controls={`panel-${item.key}`}
            className={styles.tab}
            style={titleStyle}
            onClick={() => setTab(item.key)}
          >
            {item.title}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div key={item.key} className={styles.item}>
          <button
            type="button"
            className={styles.accordionHeader}
            aria-expanded={item.key === open}
            aria-controls={`panel-${item.key}`}
            style={titleStyle}
            onClick={() => setOpen(item.key === open ? null : item.key)}
          >
            <span>{item.title}</span>
            <span className={styles.accordionSign} aria-hidden>
              {item.key === open ? "−" : "+"}
            </span>
          </button>
          <div
            id={`panel-${item.key}`}
            role="tabpanel"
            aria-labelledby={`tab-${item.key}`}
            className={styles.panel}
            data-tab-active={item.key === tab}
            data-accordion-open={item.key === open}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
