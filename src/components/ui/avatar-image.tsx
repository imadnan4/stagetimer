import Image, { type ImageProps } from "next/image";

/**
 * `next/image` inlines `color: transparent` on every image so alt text is
 * hidden while loading. The reference's plain `<img>` elements inherit the
 * foreground colour, so restore it — the merge order in `get-img-props` puts
 * the caller-supplied `style` last, which makes this a safe override.
 *
 * Every call site passes a real `alt`; the rule cannot see through the spread.
 */
export function AvatarImage(props: ImageProps) {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image {...props} style={{ color: "inherit", ...props.style }} />
  );
}
