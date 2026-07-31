import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { MockInstance } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const CHECKOUT_URL = "https://stage-timer.lemonsqueezy.com/checkout/buy/abc123?embed=1";

let SupportButton: typeof import("@/components/SupportButton").default;
let createElementSpy: MockInstance;
let appendChildSpy: MockInstance;
let removeChildSpy: MockInstance;

const originalCreateElement = document.createElement.bind(document);
const originalAppendChild = document.body.appendChild.bind(document.body);
const originalRemoveChild = document.body.removeChild.bind(document.body);

function stubScriptDom() {
  // Only fake <script> nodes; everything else goes to the real DOM so
  // React Testing Library can render normally.
  createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tag, ...rest) => {
    if (tag === "script") return originalCreateElement("script");
    return originalCreateElement(tag, ...rest);
  });
  appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
    if (node instanceof Element && node.tagName === "SCRIPT") return node;
    return originalAppendChild(node);
  });
  removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => {
    if (node instanceof Element && node.tagName === "SCRIPT") return node;
    return originalRemoveChild(node);
  });
}

beforeEach(async () => {
  vi.resetModules();
  process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL = CHECKOUT_URL;
  SupportButton = (await import("@/components/SupportButton")).default;
  stubScriptDom();
});

afterEach(() => {
  cleanup();
  delete process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SupportButton", () => {
  it("renders nothing before lemon.js loads", () => {
    const { container } = render(<SupportButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the overlay checkout link after lemon.js loads", async () => {
    render(<SupportButton />);
    const script = createElementSpy.mock.results.find((r) => r.value.tagName === "SCRIPT")?.value;
    expect(script).toBeDefined();
    expect(script.src).toBe("https://assets.lemonsqueezy.com/lemon.js");
    expect(appendChildSpy).toHaveBeenCalledWith(script);

    script.onload?.();
    const link = await screen.findByRole("link", { name: "Support the Creator" });
    expect(link).toHaveAttribute("href", CHECKOUT_URL);
    expect(link).toHaveClass("lemonsqueezy-button");
    expect(link).not.toHaveAttribute("target");
  });

  it("initializes lemon.js after the button is ready", async () => {
    const createLemonSqueezy = vi.fn();
    vi.stubGlobal("createLemonSqueezy", createLemonSqueezy);
    render(<SupportButton />);
    const script = createElementSpy.mock.results.find((r) => r.value.tagName === "SCRIPT")?.value;
    script.onload?.();
    await screen.findByRole("link", { name: "Support the Creator" });
    await waitFor(() => expect(createLemonSqueezy).toHaveBeenCalled());
  });

  it("renders nothing when the checkout URL is not configured", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL;
    SupportButton = (await import("@/components/SupportButton")).default;
    const { container } = render(<SupportButton />);
    expect(container).toBeEmptyDOMElement();
  });
});
