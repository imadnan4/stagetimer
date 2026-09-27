import { describe, it, expect, beforeEach } from "vitest";
import { getDeviceId } from "@/lib/device";

beforeEach(() => {
  window.localStorage.clear();
});

describe("getDeviceId", () => {
  it("creates a stable id and reuses it", () => {
    const first = getDeviceId();
    const second = getDeviceId();
    expect(first).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
    expect(second).toBe(first);
  });

  it("replaces a stored id that fails validation", () => {
    window.localStorage.setItem("stagetimer_device_id", "bad id!");
    const id = getDeviceId();
    expect(id).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
    expect(id).not.toBe("bad id!");
  });
});
