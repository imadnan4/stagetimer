import Image, { type ImageProps } from "next/image";
import { getAssetPath } from "@/lib/assets";

/**
 * Avatar image component optimized for static exports and production reliability.
 * Eager-loads images to prevent native lazy-loading from failing inside animated/overflow wrappers.
 * Automatically resolves basePath / production asset paths.
 */
export function AvatarImage({
  src,
  loading = "eager",
  priority = true,
  ...props
}: ImageProps) {
  const resolvedSrc = typeof src === "string" ? getAssetPath(src) : src;

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...props}
      src={resolvedSrc}
      loading={loading}
      priority={priority}
      unoptimized
      style={{ color: "inherit", ...props.style }}
    />
  );
}
