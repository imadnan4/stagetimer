import { ProcessWave } from "@/components/brand/ProcessWave";
import {
  ArrowBigRightIcon,
  BitcoinIcon,
  DollarSignIcon,
  EuroIcon,
  SignatureIcon,
} from "@/components/icons";
import { ButtonAnchor } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const DOC_CARD =
  "bg-illustration ring-foreground/5 w-16 space-y-2 rounded-md p-2 shadow-md ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)]";

/** The little "document" glyph used in every process step. */
function DocCard() {
  return (
    <div className={DOC_CARD}>
      <div className="flex items-center gap-1">
        <div className="bg-border size-2.5 rounded-full" />
        <div className="bg-border h-[3px] w-4 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <div className="bg-border h-[3px] w-2.5 rounded-full" />
          <div className="bg-border h-[3px] w-6 rounded-full" />
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-border h-[3px] w-2.5 rounded-full" />
          <div className="bg-border h-[3px] w-6 rounded-full" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="bg-border h-[3px] w-full rounded-full" />
        <div className="flex items-center gap-1">
          <div className="bg-border h-[3px] w-2/3 rounded-full" />
          <div className="bg-border h-[3px] w-1/3 rounded-full" />
        </div>
      </div>
      <SignatureIcon className="lucide lucide-signature ml-auto size-3" />
    </div>
  );
}

const CURRENCY_CARD =
  "bg-illustration before:bg-linear-to-b ring-border-illustration to-illustration shadow-black/6.5 before:border-foreground/5 before:mask-b-from-65% relative w-16 translate-y-1 -rotate-12 space-y-2 rounded-lg p-2 shadow-md ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] before:absolute before:inset-0.5 before:rounded-[6px] before:border before:from-25% before:to-75%";

const CURRENCIES = [
  {
    label: "BTC",
    tint: "text-blue-900 dark:text-blue-300",
    tintVar: "before:from-blue-500/15",
    Icon: BitcoinIcon,
  },
  {
    label: "USD",
    tint: "text-green-900 dark:text-green-300",
    tintVar: "before:from-green-500/15",
    Icon: DollarSignIcon,
  },
  {
    label: "EURO",
    tint: "text-red-900 dark:text-red-300",
    tintVar: "before:from-red-500/15",
    Icon: EuroIcon,
  },
];

function StepArrow() {
  return (
    <ArrowBigRightIcon className="lucide lucide-arrow-big-right @3xl:block fill-background stroke-background absolute inset-y-0 right-0 my-auto hidden translate-x-[150%] drop-shadow" />
  );
}

export function Process() {
  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="mask-b-from-65% pointer-events-none absolute -left-2 right-0 -mt-12 sm:-top-24 lg:inset-x-0 lg:-top-32"
      >
        <ProcessWave className="text-foreground/15 fill-card/35 w-full" />
      </div>
      <div className="relative py-24">
        <div className="@container relative mx-auto w-full max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal delay={0} y={12} blur={4}>
              <span className="text-primary text-sm uppercase">Stage Setup</span>
            </Reveal>
            <Reveal delay={80} y={18} blur={6}>
              <h2 className="text-foreground mt-8 text-4xl font-semibold md:text-5xl">
                Simple 3-Step Stage Timing
              </h2>
            </Reveal>
            <Reveal delay={160} y={16} blur={4}>
              <p className="text-muted-foreground mt-4 text-balance text-lg">
                Experience our streamlined approach to live stage timing that runs
                your crew to keep presentations on schedule with zero stress.
              </p>
            </Reveal>
          </div>

          <div className="@3xl:grid-cols-3 my-20 grid gap-12">
            <Reveal delay={100} y={20} blur={6}>
              <div className="space-y-6">
                <div className="text-center">
                  <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-zinc-500/15 text-sm font-medium text-zinc-700">
                    1
                  </span>
                  <div className="relative">
                    <div className="mx-auto my-6 w-fit">
                      <DocCard />
                    </div>
                    <StepArrow />
                  </div>
                  <h3 className="text-foreground mb-4 text-lg font-semibold">
                    Set Target Time
                  </h3>
                  <p className="text-muted-foreground text-balance">
                    Easily set timer durations or choose quick presets in sec.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200} y={20} blur={6}>
              <div className="space-y-6">
                <div className="text-center">
                  <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-zinc-500/15 text-sm font-medium text-zinc-700">
                    2
                  </span>
                  <div className="relative">
                    <div className="mx-auto my-6 w-fit">
                      <div aria-hidden="true" className="flex -space-x-4">
                        {CURRENCIES.map(({ label, tint, tintVar, Icon }) => (
                          <div
                            key={label}
                            className={`${CURRENCY_CARD} ${tintVar}`}
                          >
                            <div
                              className={`flex -translate-x-0.5 items-center gap-0.5 ${tint}`}
                            >
                              <Icon className="size-3" />
                              <span className="text-xs font-medium">{label}</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1">
                                <div className="bg-border h-[3px] w-2.5 rounded-full" />
                                <div className="bg-border h-[3px] w-6 rounded-full" />
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="bg-border h-[3px] w-2.5 rounded-full" />
                                <div className="bg-border h-[3px] w-6 rounded-full" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="bg-border h-[3px] w-full rounded-full" />
                              <div className="flex items-center gap-1">
                                <div className="bg-border h-[3px] w-2/3 rounded-full" />
                                <div className="bg-border h-[3px] w-1/3 rounded-full" />
                              </div>
                            </div>
                            <SignatureIcon className="lucide lucide-signature ml-auto size-3" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <StepArrow />
                  </div>
                  <h3 className="text-foreground mb-4 text-lg font-semibold">
                    Connect To Screens
                  </h3>
                  <p className="text-muted-foreground text-balance">
                    Open a display link or scan the QR code on stage TVs to sync
                    monitors.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300} y={20} blur={6}>
              <div className="space-y-6">
                <div className="text-center">
                  <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-zinc-500/15 text-sm font-medium text-zinc-700">
                    3
                  </span>
                  <div className="mx-auto my-6 flex w-fit gap-2">
                    <DocCard />
                    <DocCard />
                  </div>
                  <h3 className="text-foreground mb-4 text-lg font-semibold">
                    Direct Live Timers
                  </h3>
                  <p className="text-muted-foreground text-balance">
                    Send custom cue prompts, overtime warnings, & audio chimes to
                    speakers.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} y={14} blur={4}>
            <ButtonAnchor
              href="/control"
              variant="primary"
              size="md"
              display="flex"
              className="mx-auto flex w-fit"
            >
              Start Timer
            </ButtonAnchor>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
