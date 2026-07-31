import { describe, it, expect } from "vitest";
import {
  buildDisplayJoinPath,
  buildDisplayJoinPathWithToken,
  buildDisplayJoinUrl,
  parseScannedSession,
  extractSessionCodeFromScan,
} from "@/lib/sessionLinks";

describe("buildDisplayJoinPath", () => {
  it("builds a path for a valid code", () => {
    expect(buildDisplayJoinPath("ABC123")).toBe("/display?code=ABC123");
  });

  it("normalizes lowercase codes to uppercase", () => {
    expect(buildDisplayJoinPath("abc123")).toBe("/display?code=ABC123");
  });

  it("falls back to /display for invalid codes", () => {
    expect(buildDisplayJoinPath("")).toBe("/display");
    expect(buildDisplayJoinPath("ab")).toBe("/display");
    expect(buildDisplayJoinPath("WAY_TOO_LONG_CODE_123")).toBe("/display");
  });
});

describe("buildDisplayJoinPathWithToken", () => {
  it("includes a valid join token", () => {
    expect(buildDisplayJoinPathWithToken("ABC123", "tok12345")).toBe("/display?code=ABC123&join=tok12345");
  });

  it("omits invalid or missing tokens", () => {
    expect(buildDisplayJoinPathWithToken("ABC123")).toBe("/display?code=ABC123");
    expect(buildDisplayJoinPathWithToken("ABC123", "bad")).toBe("/display?code=ABC123");
  });
});

describe("buildDisplayJoinUrl", () => {
  it("prepends the origin", () => {
    expect(buildDisplayJoinUrl("ABC123", "https://stage.example", "tok12345")).toBe(
      "https://stage.example/display?code=ABC123&join=tok12345",
    );
  });

  it("returns a relative path without an origin", () => {
    expect(buildDisplayJoinUrl("ABC123")).toBe("/display?code=ABC123");
  });
});

describe("parseScannedSession", () => {
  it("parses a bare code", () => {
    expect(parseScannedSession("ABC123")).toEqual({ code: "ABC123" });
  });

  it("parses a full display URL with code and join token", () => {
    expect(
      parseScannedSession("https://stage.example/display?code=ABC123&join=tok12345"),
    ).toEqual({ code: "ABC123", joinToken: "tok12345" });
  });

  it("parses a URL with only a code", () => {
    expect(parseScannedSession("https://stage.example/display?code=abc123")).toEqual({
      code: "ABC123",
    });
  });

  it("returns null for garbage input", () => {
    expect(parseScannedSession("!!!")).toBeNull();
    expect(parseScannedSession("")).toBeNull();
    expect(parseScannedSession("this phrase is way too long to be a code")).toBeNull();
    expect(parseScannedSession("https://stage.example/display?code=!!bad!!")).toBeNull();
  });
});

describe("extractSessionCodeFromScan", () => {
  it("extracts just the code", () => {
    expect(extractSessionCodeFromScan("ABC123")).toBe("ABC123");
    expect(extractSessionCodeFromScan("https://stage.example/display?code=xyz789&join=tok12345")).toBe("XYZ789");
  });
});
