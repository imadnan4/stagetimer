/**
 * Dropdown metrics measured from the reference site: the height the header bar
 * grows to while a menu is open, and the size the dropdown viewport animates
 * between. Keyed by `NavItem["id"]` so renaming a visible label can never
 * silently break the lookup.
 */
type DropdownMetrics = {
  height: number;
  size: { width: number; height: number };
};

export const DROPDOWN_METRICS: Record<
  "product" | "solutions" | "none",
  DropdownMetrics | undefined
> = {
  product: { height: 280, size: { width: 1042, height: 278 } },
  solutions: { height: 220, size: { width: 1042, height: 208 } },
  none: undefined,
};

/** `data-scrolled` flips when scrollY > 50. */
export const SCROLL_THRESHOLD = 50;
