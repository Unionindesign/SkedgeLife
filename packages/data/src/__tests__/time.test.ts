import {
  addDaysToDate,
  addMinutesToClock,
  addMonths,
  daysBetween,
  formatClock,
  formatMonth,
  formatTime,
  formatWeekRange,
  localToUtcIso,
  minutesBetween,
  sameWallClock,
  startOfMonth,
  startOfWeek,
  utcToLocal,
  weekdayOf,
} from "../time";

// docs/rules/time.md: cover the US daylight-saving changes (second Sunday of
// March, first Sunday of November).
describe("local wall-clock time to UTC", () => {
  it("keeps 9:00 in Los Angeles at 9:00 across the November change", () => {
    expect(localToUtcIso("2026-10-26", "09:00", "America/Los_Angeles")).toBe("2026-10-26T16:00:00.000Z");
    expect(localToUtcIso("2026-11-02", "09:00", "America/Los_Angeles")).toBe("2026-11-02T17:00:00.000Z");
  });

  it("handles the March change", () => {
    expect(localToUtcIso("2027-03-13", "09:00", "America/New_York")).toBe("2027-03-13T14:00:00.000Z");
    expect(localToUtcIso("2027-03-15", "09:00", "America/New_York")).toBe("2027-03-15T13:00:00.000Z");
  });

  it("round-trips through utcToLocal", () => {
    const iso = localToUtcIso("2026-11-03", "07:30", "America/Denver");
    expect(utcToLocal(iso, "America/Denver")).toEqual({ date: "2026-11-03", time: "07:30" });
  });

  it("works in zones without daylight saving", () => {
    expect(localToUtcIso("2026-07-01", "18:00", "America/Phoenix")).toBe("2026-07-02T01:00:00.000Z");
  });
});

describe("display", () => {
  it("shows a moment in the zone asked for", () => {
    expect(formatTime("2026-11-02T17:00:00Z", "America/Los_Angeles")).toBe("9:00 AM");
    expect(formatTime("2026-11-02T17:00:00Z", "America/New_York")).toBe("12:00 PM");
  });

  it("formats wall-clock times and months", () => {
    expect(formatClock("17:30:00")).toBe("5:30 PM");
    expect(formatMonth("2026-10-17")).toBe("October 2026");
  });

  it("labels weeks within and across months", () => {
    expect(formatWeekRange("2026-10-18")).toBe("Oct 18 – 24");
    expect(formatWeekRange("2026-10-25")).toBe("Oct 25 – 31");
    expect(formatWeekRange("2026-11-29")).toBe("Nov 29 – Dec 5");
  });

  it("knows when two zones show the same time", () => {
    expect(sameWallClock("2026-07-01T12:00:00Z", "America/Los_Angeles", "America/Los_Angeles")).toBe(true);
    // Phoenix matches Los Angeles in summer, not in winter.
    expect(sameWallClock("2026-07-01T12:00:00Z", "America/Los_Angeles", "America/Phoenix")).toBe(true);
    expect(sameWallClock("2026-12-01T12:00:00Z", "America/Los_Angeles", "America/Phoenix")).toBe(false);
  });
});

describe("clock arithmetic", () => {
  it("measures durations, including past midnight", () => {
    expect(minutesBetween("09:00", "10:15")).toBe(75);
    expect(minutesBetween("23:00", "00:30")).toBe(90);
    expect(addMinutesToClock("23:30", 90)).toBe("01:00");
  });
});

describe("calendar arithmetic", () => {
  it("adds days across months and years", () => {
    expect(addDaysToDate("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDaysToDate("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToDate("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-10-01", "2026-11-01")).toBe(31);
  });

  it("finds weekdays and week and month starts", () => {
    expect(weekdayOf("2026-10-18")).toBe(0); // a Sunday
    expect(startOfWeek("2026-10-21")).toBe("2026-10-18");
    expect(startOfMonth("2026-10-21")).toBe("2026-10-01");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-01");
    expect(addMonths("2026-01-31", -1)).toBe("2025-12-01");
  });
});
