import { PricingChart } from "@/components/features/pricing-chart";
import {
  CalendarDaysIcon,
  ChevronsUpDownIcon,
  Clock2Icon,
  GlobeIcon,
  LanguagesIcon,
  LightbulbIcon,
  PenLineIcon,
  SearchIcon,
  SparkleIcon,
  ZapIcon,
} from "@/components/icons";
import { SectionIntro } from "@/components/ui/section-intro";

const LANGUAGES: [string, string][] = [
  ["🇨🇩", "Lingala"],
  ["🇺🇸", "English"],
  ["🇫🇷", "French"],
  ["🇨🇳", "Chinese"],
];

/** The repeated "Speed Is Everything" strip. The 4th copy is mobile-only. */
const SPEED_STRIP = [
  { id: "clock", Icon: Clock2Icon, belowMdOnly: false },
  { id: "zap", Icon: ZapIcon, belowMdOnly: false },
  { id: "calendar", Icon: CalendarDaysIcon, belowMdOnly: false },
  { id: "calendar-mobile", Icon: CalendarDaysIcon, belowMdOnly: true },
] as const;

const SUGGESTIONS = [
  { id: "ask", Icon: SearchIcon, label: "Wrap Up Soon" },
  { id: "write", Icon: PenLineIcon, label: "Two minutes to wrap!" },
  { id: "explore", Icon: LightbulbIcon, label: "Time Is Up!  " },
] as const;

export function Features() {
  return (
    <section className="@container overflow-hidden py-16">
      <div className="mx-auto max-w-5xl px-6">
        <SectionIntro
          title="Built to power stage clocks in live events"
          description="StageTimer is a fast and reliable real-time stage clock that helps your speakers stay on time with zero worries."
        />
        <div className="@4xl:grid-cols-6 mt-16 grid gap-2 *:shadow-lg *:shadow-black/5 lg:-mx-8">
          <div
            data-slot="card"
            className="ring-foreground/6.5 bg-card text-card-foreground rounded-xl shadow ring-1 @4xl:col-span-3 row-span-2 grid grid-rows-subgrid gap-8"
          >
            <div className="px-8 pt-8">
              <h3 className="text-balance font-semibold">
                Live stage timer clock engine
              </h3>
              <p className="text-muted-foreground mt-3">
                Monitor countdown pace, warning thresholds, and overtime with
                real-time studio screens and speaker confidence.
              </p>
            </div>
            <div className="self-end pb-4">
              <PricingChart />
            </div>
          </div>

          <div
            data-slot="card"
            className="ring-foreground/6.5 bg-card text-card-foreground rounded-xl shadow ring-1 @4xl:col-span-3 row-span-2 grid grid-rows-subgrid gap-8"
          >
            <div className="relative z-10 px-8 pt-8">
              <h3 className="text-balance font-semibold">
                Smart speaker alerts
              </h3>
              <p className="text-muted-foreground mt-3">
                Get real-time visual flashes for what&apos;s urgent, plus
                custom stage prompts, cues, and time tweaks for every talk.
              </p>
            </div>
            <div className="self-end px-8 pb-8">
              <div aria-hidden="true" className="relative mt-6">
                <div className="z-1 scale-80 absolute -top-6 bottom-0 left-6 right-0 origin-top-right sm:left-28">
                  <div className="bg-card/75 ring-border-illustration flex flex-col rounded-2xl border border-transparent p-4 shadow-2xl shadow-blue-950/25 ring-1 backdrop-blur-lg">
                    <div>
                      <div className="animate-hue-rotate relative size-fit">
                        <div className="bg-conic/decreasing relative flex size-5 items-center justify-center rounded-full from-violet-500 via-lime-300 to-violet-400 blur-md" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <SparkleIcon className="lucide lucide-sparkle size-4 fill-white stroke-white drop-shadow-sm" />
                        </div>
                      </div>
                      <p className="mt-3 text-balance text-sm leading-tight">
                        StageTimer: Talk starts in 05 mins!
                      </p>
                    </div>
                    <div className="my-6 text-sm">
                      <div className="text-muted-foreground text-xs">
                        Stage Cues  
                      </div>
                      <div className="-mx-2 mt-2 cursor-pointer">
                        {SUGGESTIONS.map(({ id, Icon, label }) => (
                          <div
                            key={id}
                            className="hover:bg-foreground/5 flex items-center gap-2 rounded-lg px-2 py-1.5"
                          >
                            <Icon className="size-4" />
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-foreground/3 ring-border-illustration mt-auto overflow-hidden rounded-lg shadow shadow-indigo-950/10 ring-1">
                      <div className="text-muted-foreground bg-foreground/3 border-foreground/5 rounded-lg border-b p-3 text-xs">
                        <span>
                          Flashed notification &ldquo;WRAP UP&rdquo; banner
                          on all screens now.
                        </span>
                      </div>
                      <div className="text-muted-foreground px-3 py-2 text-xs">
                        <span>Cue msg.</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mask-b-from-50% rounded-xl border">
                  <div className="absolute inset-y-0 left-0 w-32 border-r">
                    <div className="flex gap-1.5 px-4 pt-4">
                      <div className="bg-foreground/5 border-foreground/5 size-2 rounded-full border" />
                      <div className="bg-foreground/5 border-foreground/5 size-2 rounded-full border" />
                      <div className="bg-foreground/5 border-foreground/5 size-2 rounded-full border" />
                    </div>
                  </div>
                  <div className="ml-auto w-[calc(100%-8rem)]">
                    <div className="h-11 border-b" />
                    <div className="relative h-52">
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            data-slot="card"
            className="ring-foreground/6.5 bg-card text-card-foreground rounded-xl shadow ring-1 @4xl:col-span-2 row-span-2 grid grid-rows-subgrid gap-8"
          >
            <div className="relative z-10 px-8 pt-8">
              <h3 className="text-balance font-semibold">
                Multi-display stage screen
              </h3>
              <p className="text-muted-foreground mt-3">
                Auto-sync countdown clocks and speaker prompts across multiple
                stage monitors with split-second precision.
              </p>
            </div>
            <div className="self-end px-8 pb-8">
              <div aria-hidden="true">
                <div className="relative mx-4">
                  <div className="border-foreground/15 absolute -inset-x-6 inset-y-0 border-y border-dashed" />
                  <div className="border-foreground/15 absolute -inset-y-6 inset-x-0 border-x border-dashed" />
                  <div className="ring-foreground/75 relative w-full rounded-xl border border-white/25 bg-zinc-700 p-1 shadow-xl shadow-black/35 ring">
                    <ul role="list" className="text-sm text-white">
                      {LANGUAGES.map(([flag, label]) => (
                        <li
                          key={label}
                          className="hover:bg-background/10 not-first:opacity-80 active:scale-99 flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-1.5 duration-200 hover:opacity-100"
                        >
                          <span className="text-xl">{flag}</span>
                          <span className="font-medium">{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-muted border-foreground/5 mx-auto my-4 flex h-8 w-fit items-center gap-2 rounded-md border px-3">
                  <LanguagesIcon className="lucide lucide-languages size-4" />
                  <p className="text-muted-foreground text-sm">Monitor</p>
                  <ChevronsUpDownIcon className="lucide lucide-chevrons-up-down ml-6 size-3" />
                </div>
                <div className="text-muted-foreground flex items-center justify-center gap-2">
                  <GlobeIcon className="lucide lucide-globe size-3" />
                  <span className="text-xs">Zero-lag WebSocket sync</span>
                </div>
              </div>
            </div>
          </div>

          <div
            data-slot="card"
            className="ring-foreground/6.5 bg-card text-card-foreground rounded-xl shadow ring-1 @4xl:col-span-4 row-span-2 grid grid-rows-subgrid"
          >
            <div className="relative z-10 px-8 pt-8">
              <h3 className="text-balance font-semibold">
                One-click stage sharing 
              </h3>
              <p className="text-muted-foreground mt-3">
                Share instant display links that connect stage monitors and
                verify via a room code for fully frictionless live timing.
              </p>
            </div>
            <div className="self-end px-8 pb-8">
              <div className="relative -mx-8">
                <div className="mask-radial-at-top blur-xs mask-radial-from-65% mask-radial-[100%_100%] absolute inset-0 backdrop-blur">
                  <div className="bg-linear-to-r mask-radial-at-bottom mask-radial-from-65% mask-radial-[100%_100%] size-full from-emerald-200 to-indigo-300" />
                  <div className="absolute inset-x-0 top-6 grid h-fit grid-cols-2 pt-8">
                    <div className="-rotate-12">
                      <CheckoutCard />
                    </div>
                    <div className="rotate-12">
                      <CheckoutCard />
                    </div>
                  </div>
                </div>
                <div className="relative z-10 mx-auto h-full max-w-md px-8 py-6">
                  <CheckoutCard />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="@4xl:gap-12 @4xl:grid-cols-3 relative mt-16 grid grid-cols-2 gap-6">
          {SPEED_STRIP.map(({ id, Icon, belowMdOnly }) => (
            <div
              key={id}
              className={belowMdOnly ? "space-y-1.5 md:hidden" : "space-y-1.5"}
            >
              <Icon className="size-4 fill-foreground/10" />
              <h3 className="mt-3 font-medium">Timing Is Essential</h3>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                StageTimer is a fast and reliable real-time stage clock that
                helps your speakers stay on time with zero worries.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CODE_CELL =
  "bg-background/75 ring-foreground/10 h-8 rounded border border-transparent shadow-md shadow-black/10 ring-1";

/** The stacked "Checkout with Link" card, drawn three times. */
function CheckoutCard() {
  return (
    <div
      aria-hidden="true"
      className="relative [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-emerald-500)]"
    >
      <div className="inset-shadow-sm inset-shadow-white/3 ring-foreground/10 bg-background/75 relative space-y-5 rounded-2xl p-2 shadow-2xl shadow-black/15 ring-1 backdrop-blur-xl">
        <div>
          <div className="text-muted-foreground px-2 pb-2 text-sm">
            stage@studio1.com
          </div>
          <div className="bg-card ring-foreground/10 flex flex-col gap-2 rounded-md border border-transparent p-4 shadow ring-1">
            <div className="text-foreground mb-1 text-sm font-medium">
              Join Stage Display
            </div>
            <div className="text-muted-foreground text-sm">
              Connect your stage display to this control room session. Enter
              the room PIN code shown on screen to start syncing in real-time.
            </div>
            <div className="mx-auto mb-3 mt-5 grid w-56 grid-cols-2 gap-4">
              <div className="*:hover:ring-foreground/15 grid grid-cols-3 gap-1.5">
                <div className="bg-background/75 hover:ring-emerald-500! relative flex h-8 items-center justify-center rounded border border-transparent font-mono text-sm shadow-md shadow-black/10 ring-1 ring-emerald-500">
                  <div className="absolute -inset-px rounded bg-emerald-500/15" />
                  <div className="absolute inset-x-1.5 bottom-1 h-px bg-emerald-900/50" />
                  0
                </div>
                <div className={CODE_CELL} />
                <div className={CODE_CELL} />
              </div>
              <div className="*:hover:ring-foreground/15 grid grid-cols-3 gap-1.5">
                <div className={CODE_CELL} />
                <div className={CODE_CELL} />
                <div className={CODE_CELL} />
              </div>
            </div>
          </div>
          <div className="text-muted-foreground px-2 pt-2 text-xs">
            StageTimer Sync
          </div>
        </div>
      </div>
    </div>
  );
}
