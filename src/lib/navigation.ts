import type { NavIconName } from "@/components/brand/NavIcons";

type NavChild = {
  title: string;
  description?: string;
  href: string;
  icon: NavIconName;
};

type NavColumn = {
  title: string;
  items: NavChild[];
};

export type NavItem = {
  /** Stable key used to look up the dropdown's measured viewport metrics. */
  id: "product" | "solutions" | "link";
  title: string;
  href?: string;
  columns?: NavColumn[];
};

export const navigation = [
  {
    id: "product",
    title: "Product",
    columns: [
      {
        title: "Features",
        items: [
          {
            title: "AV",
            description: "Sync countdowns across every display!",
            href: "#ux",
            icon: "sparkles",
          },
          {
            title: "Zero-Lag WS",
            description: "Instant broadcast updates",
            href: "#performance",
            icon: "square-activity",
          },
          {
            title: "Security",
            description: "Locked rooms with passcode key",
            href: "#security",
            icon: "shield",
          },
        ],
      },
      {
        title: "More Features",
        items: [
          {
            title: "Auto-Count",
            description: "Manage stage schedules",
            href: "#ux",
            icon: "bot",
          },
          {
            title: "Multi-Timer",
            description: "Sync infinite monitors",
            href: "#performance",
            icon: "rocket",
          },
          {
            title: "Chimes",
            description: "Audio chimes for speaker",
            href: "#security",
            icon: "cloud",
          },
          {
            title: "Controls",
            description: "Safe controller room passcodes",
            href: "#security",
            icon: "shield",
          },
          {
            title: "AV Operators",
            description: "Quick alerts for speakers",
            href: "#support",
            icon: "gem",
          },
          {
            title: "Any Device",
            description: "Runs on any modern screen",
            href: "#mobile",
            icon: "smartphone",
          },
        ],
      },
      {
        title: "Changelog",
        items: [],
      },
    ],
  },
  {
    id: "solutions",
    title: "Solutions",
    columns: [
      {
        title: "Use Cases",
        items: [
          {
            title: "Live Events",
            description: "Stage timing for show",
            href: "#ux",
            icon: "shopping-bag",
          },
          {
            title: "Display Mirrors",
            description: "Cast timers to stage screens now",
            href: "#security",
            icon: "cpu",
          },
          {
            title: "Broadcasting",
            description: "TV studios & live podcast",
            href: "#support",
            icon: "gem",
          },
          {
            title: "Prompt Cue",
            description: "Speaker prompt cue banner",
            href: "#mobile",
            icon: "smartphone",
          },
        ],
      },
      {
        title: "Content",
        items: [
          {
            title: "Speaker Cues ",
            description: "",
            href: "#link",
            icon: "book-open",
          },
          {
            title: "Protocols",
            description: "",
            href: "#link",
            icon: "croissant",
          },
          {
            title: "Docs",
            description: "",
            href: "#link",
            icon: "notebook",
          },
        ],
      },
    ],
  },
  { id: "link", title: "Pricing", href: "#pricing" },
  { id: "link", title: "Company", href: "#" },
] satisfies readonly NavItem[];

export type MobileNavSection = {
  id: "product" | "solutions";
  title: string;
  items: { title: string; href: string; icon: NavIconName }[];
};

export const mobileNavigation: MobileNavSection[] = [
  {
    id: "product",
    title: "Product",
    items: [
      { title: "AV", href: "#ux", icon: "sparkles" },
      { title: "Zero-Lag WS", href: "#performance", icon: "square-activity" },
      { title: "Security", href: "#security", icon: "shield" },
    ],
  },
  {
    id: "solutions",
    title: "Solutions",
    items: [
      { title: "Live Events", href: "#ux", icon: "shopping-bag" },
      { title: "Display Mirrors", href: "#security", icon: "cpu" },
      { title: "Broadcasting", href: "#support", icon: "gem" },
      { title: "Prompt Cue", href: "#mobile", icon: "smartphone" },
      { title: "Speaker Cues ", href: "#link", icon: "book-open" },
      { title: "Protocols", href: "#link", icon: "croissant" },
      { title: "Docs", href: "#link", icon: "notebook" },
    ],
  },
];

export const footerSections = [
  {
    title: "Product",
    links: [
      { title: "Stage Controller", href: "/control" },
      { title: "Stage Display", href: "/display" },
      { title: "Features", href: "#features" },
      { title: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { title: "Live Conferences", href: "#ux" },
      { title: "Broadcast Studios", href: "#performance" },
      { title: "Podcasts & Shows", href: "#security" },
      { title: "Speaker Cues", href: "#support" },
    ],
  },
  {
    title: "Legal & Support",
    links: [
      { title: "Start Timer", href: "/control" },
      { title: "Privacy Policy", href: "#" },
      { title: "Terms of Service", href: "#" },
    ],
  },
];
