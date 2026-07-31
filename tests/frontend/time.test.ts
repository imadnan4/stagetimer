import { describe, it, expect } from "vitest";
import { formatDuration } from "@/lib/time";

describe("formatDuration", () => {
  it("formats zero", () => {
    expect(formatDuration(0)).toBe("00:00");
  });

  it("formats seconds-only durations", () => {
    expect(formatDuration(59_999)).toBe("00:59");
  });

  it("formats full minutes", () => {
    expect(formatDuration(5 * 60_000)).toBe("05:00");
  });

  it("formats durations over an hour as cumulative minutes", () => {
    expect(formatDuration(90 * 60_000)).toBe("90:00");
  });

  it("truncates sub-second parts", () => {
    expect(formatDuration(61_999)).toBe("01:01");
  });

  it("prefixes negative durations with a minus sign", () => {
    expect(formatDuration(-1000)).toBe("-00:01");
  });
});
