import type { ComponentProps } from "react";

/**
 * Button base classes, copied verbatim from the reference markup.
 *
 * Note the deliberate absence of `tailwind-merge` here: the reference emits
 * conflicting radius utilities in a single class list (e.g. `rounded-sm` from
 * the base plus `rounded-md` from the size) and lets the cascade resolve it —
 * `rounded-sm` is generated later, so it wins at 6px. Merging the duplicates
 * away would change the rendered radius.
 */
const BASE =
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.5em] font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

/**
 * The reference ships a second button base that omits `inline-flex`; the
 * "Get Started" call to action in the Process section uses it so it can take
 * `flex w-fit` and be centred.
 */
const BASE_BLOCK = BASE.replace(
  "cursor-pointer inline-flex ",
  "cursor-pointer ",
);

const VARIANTS = {
  primary: "btn-primary",
  secondary:
    "transition-colors duration-200 shadow-sm shadow-black/15 border border-transparent bg-card text-foreground ring ring-foreground/10 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring",
  destructive:
    "transition-colors duration-200 shadow-sm shadow-black/15 border border-transparent bg-red-600/90 text-white hover:bg-red-600 focus-visible:ring-1 focus-visible:ring-red-400",
} as const;

const SIZES = {
  sm: "h-8 px-3 py-1 text-sm",
  md: "h-9 px-4 py-1 text-base font-medium",
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

function buttonClasses({
  variant = "secondary",
  size = "md",
  display = "inline-flex",
  className,
}: {
  variant?: Variant;
  size?: Size;
  display?: "inline-flex" | "flex";
  className?: string;
} = {}) {
  const base = display === "flex" ? BASE_BLOCK : BASE;
  return [base, VARIANTS[variant], SIZES[size], className]
    .filter(Boolean)
    .join(" ");
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  display?: "inline-flex" | "flex";
  className?: string;
};

export function ButtonAnchor({
  variant,
  size,
  display,
  className,
  ...props
}: CommonProps & Omit<ComponentProps<"a">, "className">) {
  return (
    <a
      className={buttonClasses({ variant, size, display, className })}
      {...props}
    />
  );
}

export function Button({
  variant,
  size,
  display,
  className,
  ...props
}: CommonProps & Omit<ComponentProps<"button">, "className">) {
  return (
    <button
      className={buttonClasses({ variant, size, display, className })}
      {...props}
    />
  );
}
