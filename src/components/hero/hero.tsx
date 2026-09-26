import { LogoStrip } from "@/components/hero/logo-strip";
import { HeroCta } from "@/components/hero/hero-cta";
import { HeroVideo } from "@/components/hero/hero-video";

/** Decorative window chrome: 4 corner dots plus two beveled "pills". */
const DOT_BASE = "size-3.5 rounded-full border-transparent p-0.5";

type CornerPosition =
  "left-2 top-2" | "right-2 top-2" | "bottom-2 left-2" | "bottom-2 right-2";

function ChromeDot({ position }: { position: CornerPosition }) {
  return (
    <div className={`bg-foreground/5 absolute ${position} ${DOT_BASE}`}>
      <div className="bg-card ring-foreground/10 size-full rounded-full p-px shadow ring">
        <div className="bg-foreground/20 rounded-xs size-full scale-75 [corner-shape:notch]" />
      </div>
    </div>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mb-32">
      <div
        aria-hidden="true"
        className="max-w-280 bg-foreground/1 border-card ring-border absolute inset-x-0 -bottom-10 -top-4 mx-auto grid grid-cols-[auto_1fr] gap-3 border p-6 ring *:border sm:-bottom-12 sm:-top-6"
      >
        <ChromeDot position="left-2 top-2" />
        <ChromeDot position="right-2 top-2" />
        <ChromeDot position="bottom-2 left-2" />
        <ChromeDot position="bottom-2 right-2" />
        <div className="ring-border border-card sm:w-51 w-22 rounded-md ring [corner-shape:bevel]" />
        <div className="ring-border border-card rounded-md ring [corner-shape:bevel]" />
      </div>
      <div className="pointer-events-none relative h-full pl-2 pt-6 max-sm:pr-2 lg:px-12">
        {children}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <div className="bg-linear-to-b from-background relative overflow-hidden pb-32 pt-32 sm:pt-48">
      <div className="relative mx-auto max-w-5xl">
        <div className="pb-12 text-center">
          <div className="animate-reveal">
            <h1 className="mx-auto max-w-4xl text-balance text-5xl font-medium tracking-tight max-lg:font-semibold md:text-6xl">
              Precision stage timer, keep events on schedule
            </h1>
          </div>
          <div className="animate-reveal [animation-delay:150ms]">
            <p className="text-muted-foreground mx-auto mb-8 mt-6 max-w-2xl text-balance text-lg max-md:mx-auto lg:text-xl">
              Synchronize stage countdowns across displays with zero setup.
              Prevent timing overruns, run on schedule!
            </p>
          </div>
          <div className="animate-reveal [animation-delay:300ms]">
            <HeroCta />
          </div>
        </div>
      </div>
      <div>
        <div className="animate-reveal [animation-delay:450ms]">
          <BrowserFrame>
            <HeroVideo />
          </BrowserFrame>
        </div>
        <div className="animate-reveal [animation-delay:600ms]">
          <LogoStrip />
        </div>
      </div>
    </div>
  );
}
