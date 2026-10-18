import {
  WEEKDAYS,
  addMinutesToClock,
  buildTimetable,
  dateDetails,
  describeChange,
  formatClock,
  formatDate,
  formatTime,
  utcToLocal,
  zoneLabel,
  type DateDetails,
  type EventWithVenue,
  type OccurrenceWithEvent,
} from "@skedgelife/data";
import { safeUrl } from "@/lib/urls";
import { LocalTime } from "./LocalTime";
import styles from "./Schedule.module.css";

function place(d: Pick<DateDetails, "format" | "is_private_home" | "area" | "venue">) {
  if (d.format === "online") return "Online";
  // A private home's address and name stay private; visitors see the area.
  if (d.is_private_home) return d.area ? `${d.area} (private home)` : "Private home";
  return d.venue?.name ?? "";
}

function BookLink({ mode, url, accent }: { mode: string; url: string | null; accent: string }) {
  const href = mode === "external_link" ? safeUrl(url) : null;
  if (!href) return null;
  return (
    <a className={styles.book} style={{ color: accent }} href={href} target="_blank" rel="noopener noreferrer">
      Book →
    </a>
  );
}

// The weekly timetable, then what's coming up that it can't show: one-off
// events, and this fortnight's changes to weekly classes.
export function Schedule({
  weekly,
  oneOffs,
  changes,
  accent,
  headingFont,
}: {
  weekly: EventWithVenue[];
  oneOffs: OccurrenceWithEvent[];
  changes: OccurrenceWithEvent[];
  accent: string;
  headingFont?: string;
}) {
  // Weekly times are shown in the class's own zone, named, since that's where the class is.
  const now = new Date().toISOString();
  return (
    <div className={styles.schedule}>
      {weekly.length > 0 ? (
        <div className={styles.timetable}>
          {buildTimetable(weekly).map((day) => (
            <div key={day.weekday} className={styles.day}>
              <h3 className={styles.dayName} style={{ fontFamily: headingFont, color: accent }}>
                {WEEKDAYS[day.weekday]}
              </h3>
              <ul className={styles.entries}>
                {day.events.map((e) => {
                  const start = (e.local_start_time ?? "00:00").slice(0, 5);
                  return (
                    <li key={e.id} className={styles.entry}>
                      <span className={styles.time}>
                        {formatClock(start)}
                        <span className={styles.until}>
                          to {formatClock(addMinutesToClock(start, e.duration_minutes ?? 60))}{" "}
                          {zoneLabel(now, e.time_zone)}
                        </span>
                      </span>
                      <span className={styles.what}>
                        <strong>{e.title}</strong>
                        <span className={styles.where}>{place(e)}</span>
                      </span>
                      <BookLink mode={e.booking_mode} url={e.booking_url} accent={accent} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {oneOffs.length + changes.length > 0 ? (
        <div className={styles.comingUp}>
          <h3 className={styles.comingUpTitle} style={{ fontFamily: headingFont }}>
            Coming up
          </h3>
          <ul className={styles.entries}>
            {[...oneOffs, ...changes]
              .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
              .map((o) => {
                const d = dateDetails(o);
                const day = formatDate(utcToLocal(o.starts_at, d.time_zone).date, "short");
                const change = o.event.weekly_days ? describeChange(o) : null;
                return (
                  <li key={o.id} className={styles.entry}>
                    <span className={styles.time}>
                      <span className={styles.date}>{day}</span>
                      {d.format === "online" ? (
                        <LocalTime
                          startsAt={o.starts_at}
                          endsAt={o.ends_at}
                          eventZone={d.time_zone}
                          className={styles.until}
                        />
                      ) : (
                        <time dateTime={o.starts_at}>
                          {formatTime(o.starts_at, d.time_zone)}
                          <span className={styles.until}>
                            to {formatTime(o.ends_at, d.time_zone)} {zoneLabel(o.starts_at, d.time_zone)}
                          </span>
                        </time>
                      )}
                    </span>
                    <span className={styles.what}>
                      <strong className={o.status === "cancelled" ? styles.cancelled : undefined}>
                        {o.event.title}
                      </strong>
                      {change ? (
                        <span
                          className={styles.change}
                          style={{ color: o.status === "cancelled" ? "#b3261e" : accent }}
                        >
                          {change}
                        </span>
                      ) : null}
                      <span className={styles.where}>{place(d)}</span>
                      {!change && d.description ? <span className={styles.description}>{d.description}</span> : null}
                    </span>
                    {o.status === "scheduled" ? (
                      <BookLink mode={d.booking_mode} url={d.booking_url} accent={accent} />
                    ) : null}
                  </li>
                );
              })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
