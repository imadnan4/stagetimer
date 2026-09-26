import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";

/**
 * The eyebrow + heading + lede block that opens the Features, Benefits and
 * Testimonials sections.
 */
export function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <>
      {eyebrow ? (
        <Reveal delay={0} y={12} blur={4}>
          <span className="text-primary font-mono text-sm uppercase">
            {eyebrow}
          </span>
        </Reveal>
      ) : null}
      <div
        className={
          eyebrow
            ? "mt-8 grid items-end gap-6 md:grid-cols-2"
            : "grid items-end gap-6 md:grid-cols-2"
        }
      >
        <Reveal delay={60} y={18} blur={6}>
          <h2 className="text-foreground text-4xl font-semibold md:text-5xl">
            {title}
          </h2>
        </Reveal>
        <div className="lg:pl-12">
          <Reveal delay={140} y={16} blur={4}>
            <p className="text-muted-foreground text-balance">{description}</p>
          </Reveal>
        </div>
      </div>
    </>
  );
}
