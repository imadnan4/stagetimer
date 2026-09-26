import { AvatarImage } from "@/components/ui/avatar-image";

/**
 * Avatar + name + role, shared by the pull-quote and the testimonial cards.
 * The class strings are the reference's, verbatim.
 */
export function Attribution({
  name,
  role,
  avatar,
  alt,
}: {
  name: string;
  role: string;
  avatar: string;
  alt: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 pl-px">
      <div className="ring-foreground/10 aspect-square size-12 overflow-hidden rounded-xl border border-transparent shadow-md shadow-black/15 ring-1">
        <AvatarImage
          alt={alt}
          width={460}
          height={460}
          sizes="48px"
          src={avatar}
        />
      </div>
      <div className="space-y-0.5 text-base *:block">
        <span className="text-foreground font-medium">{name}</span>
        <span className="text-muted-foreground text-sm">{role}</span>
      </div>
    </div>
  );
}
