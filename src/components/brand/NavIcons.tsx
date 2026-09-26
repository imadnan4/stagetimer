import type { SVGProps } from "react";

/**
 * The navigation icons, vendored verbatim from the reference. Each carries
 * the exact `lucide lucide-*` + `stroke-foreground fill-<colour>` class
 * string it has there, so the tinted fills render identically. Newer
 * lucide releases redraw several of these paths, so they are pinned.
 */

type IconProps = SVGProps<SVGSVGElement>;

function shell(props: IconProps) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

function BookOpenIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ??
        "lucide lucide-book-open stroke-foreground fill-purple-500/15"
      }
    >
      <path d="M12 7v14"></path>
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
    </svg>
  );
}

function BotIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ?? "lucide lucide-bot stroke-foreground fill-yellow-500/15"
      }
    >
      <path d="M12 8V4H8"></path>
      <rect width="16" height="12" x="4" y="8" rx="2"></rect>
      <path d="M2 14h2"></path>
      <path d="M20 14h2"></path>
      <path d="M15 13v2"></path>
      <path d="M9 13v2"></path>
    </svg>
  );
}

function CloudIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ?? "lucide lucide-cloud stroke-foreground fill-teal-500/15"
      }
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
    </svg>
  );
}

function CpuIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ?? "lucide lucide-cpu stroke-foreground fill-blue-500/15"
      }
    >
      <rect width="16" height="16" x="4" y="4" rx="2"></rect>
      <rect width="6" height="6" x="9" y="9" rx="1"></rect>
      <path d="M15 2v2"></path>
      <path d="M15 20v2"></path>
      <path d="M2 15h2"></path>
      <path d="M2 9h2"></path>
      <path d="M20 15h2"></path>
      <path d="M20 9h2"></path>
      <path d="M9 2v2"></path>
      <path d="M9 20v2"></path>
    </svg>
  );
}

function CroissantIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ?? "lucide lucide-croissant stroke-foreground fill-red-500/15"
      }
    >
      <path d="m4.6 13.11 5.79-3.21c1.89-1.05 4.79 1.78 3.71 3.71l-3.22 5.81C8.8 23.16.79 15.23 4.6 13.11Z"></path>
      <path d="m10.5 9.5-1-2.29C9.2 6.48 8.8 6 8 6H4.5C2.79 6 2 6.5 2 8.5a7.71 7.71 0 0 0 2 4.83"></path>
      <path d="M8 6c0-1.55.24-4-2-4-2 0-2.5 2.17-2.5 4"></path>
      <path d="m14.5 13.5 2.29 1c.73.3 1.21.7 1.21 1.5v3.5c0 1.71-.5 2.5-2.5 2.5a7.71 7.71 0 0 1-4.83-2"></path>
      <path d="M18 16c1.55 0 4-.24 4 2 0 2-2.17 2.5-4 2.5"></path>
    </svg>
  );
}

function GemIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ?? "lucide lucide-gem stroke-foreground fill-pink-500/15"
      }
    >
      <path d="M6 3h12l4 6-10 13L2 9Z"></path>
      <path d="M11 3 8 9l4 13 4-13-3-6"></path>
      <path d="M2 9h20"></path>
    </svg>
  );
}

function NotebookIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ?? "lucide lucide-notebook stroke-foreground fill-zinc-500/15"
      }
    >
      <path d="M2 6h4"></path>
      <path d="M2 10h4"></path>
      <path d="M2 14h4"></path>
      <path d="M2 18h4"></path>
      <rect width="16" height="20" x="4" y="2" rx="2"></rect>
      <path d="M16 2v20"></path>
    </svg>
  );
}

function RocketIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ?? "lucide lucide-rocket stroke-foreground fill-orange-500/15"
      }
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
    </svg>
  );
}

function ShieldIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ?? "lucide lucide-shield stroke-foreground fill-blue-500/15"
      }
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
    </svg>
  );
}

function ShoppingBagIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ??
        "lucide lucide-shopping-bag stroke-foreground fill-emerald-500/25"
      }
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
      <path d="M3 6h18"></path>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
}

function SmartphoneIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ??
        "lucide lucide-smartphone stroke-foreground fill-zinc-500/15"
      }
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
      <path d="M12 18h.01"></path>
    </svg>
  );
}

function SparklesIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ??
        "lucide lucide-sparkles stroke-foreground fill-green-500/15"
      }
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
      <path d="M20 3v4"></path>
      <path d="M22 5h-4"></path>
      <path d="M4 17v2"></path>
      <path d="M5 18H3"></path>
    </svg>
  );
}

function SquareActivityIcon({ className, ...props }: IconProps) {
  return (
    <svg
      {...shell(props)}
      className={
        className ??
        "lucide lucide-square-activity stroke-foreground fill-indigo-500/15"
      }
    >
      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
      <path d="M17 12h-2l-2 5-2-10-2 5H7"></path>
    </svg>
  );
}

const ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  "book-open": BookOpenIcon,
  bot: BotIcon,
  cloud: CloudIcon,
  cpu: CpuIcon,
  croissant: CroissantIcon,
  gem: GemIcon,
  notebook: NotebookIcon,
  rocket: RocketIcon,
  shield: ShieldIcon,
  "shopping-bag": ShoppingBagIcon,
  smartphone: SmartphoneIcon,
  sparkles: SparklesIcon,
  "square-activity": SquareActivityIcon,
};

export type NavIconName = keyof typeof ICONS;

/** Renders a nav icon by its lucide name. */
export function NavIcon({ name }: { name: NavIconName }) {
  const Icon = ICONS[name];
  return <Icon />;
}
