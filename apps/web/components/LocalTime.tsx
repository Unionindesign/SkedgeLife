"use client";

import { useSyncExternalStore } from "react";
import { deviceTimeZone, formatTime, zoneLabel } from "@skedgelife/data";

// The browser's zone doesn't change while the page is open, so there's nothing to subscribe to.
const subscribe = () => () => {};

// An online event's time. The server can't know the visitor's zone, so it
// renders the event's own zone with its name; in the browser it shows the
// visitor's zone instead (docs/rules/time.md, rule 7).
export function LocalTime({
  startsAt,
  endsAt,
  eventZone,
  className,
}: {
  startsAt: string;
  endsAt: string;
  eventZone: string;
  className?: string;
}) {
  const zone = useSyncExternalStore(subscribe, deviceTimeZone, () => eventZone);
  return (
    <time dateTime={startsAt}>
      {formatTime(startsAt, zone)}
      <span className={className}>
        to {formatTime(endsAt, zone)} {zoneLabel(startsAt, zone)}
      </span>
    </time>
  );
}
