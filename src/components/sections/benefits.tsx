import { AvatarImage } from "@/components/ui/avatar-image";

import { BenefitsWave } from "@/components/brand/BenefitsWave";
import { SectionIntro } from "@/components/ui/section-intro";
import { PlayIcon, SignatureIcon } from "@/components/icons";

export function Benefits() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="mask-b-from-65% absolute -inset-x-7 top-12"
      >
        <BenefitsWave className="text-foreground/15 fill-card/35 max-md:scale-x-250 w-full origin-top-right max-md:translate-x-3 max-md:scale-y-125" />
      </div>
      <div
        aria-hidden="true"
        className="mask-t-from-65% absolute -inset-x-7 bottom-0"
      >
        <BenefitsWave className="text-foreground/15 fill-card/35 max-md:scale-x-250 w-full origin-top-right max-md:translate-x-3 max-md:scale-y-125" />
      </div>

      <div className="@container relative pb-24 pt-32">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div>
            <SectionIntro
              eyebrow="Benefits"
              title={" Precision timing tools for live shows now"}
              description="Our platform combines zero-latency stage sync with modern timer controls to streamline your live events workflow and prevent overruns."
            />
          </div>

          <div className="@xl:grid-cols-2 @3xl:grid-cols-3 mt-16 grid gap-2 *:shadow-lg *:shadow-black/5 lg:-mx-8">
            <div
              data-slot="card"
              className="ring-foreground/6.5 bg-card text-card-foreground shadow ring-1 group grid grid-rows-[auto_1fr] gap-8 rounded-2xl p-8"
            >
              <div>
                <h3 className="text-foreground font-semibold">
                  Multi-screen sync 
                </h3>
                <p className="text-muted-foreground mt-3">
                  Broadcast time across confidence screens, backstage TVs,
                  and operator consoles in real time.
                </p>
              </div>
              <div aria-hidden="true" className="relative self-center">
                <div className="mb-18 space-y-1.5">
                  <div className="flex items-center gap-1">
                    <div className="bg-border h-1 w-1/5 rounded-full" />
                    <div className="bg-border h-1 w-2/5 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-border h-1 w-1/5 rounded-full" />
                    <div className="bg-border h-1 w-4/5 rounded-full" />
                  </div>
                </div>
                <div className="relative">
                  <div
                    data-theme="dark"
                    className="bg-background absolute w-full -translate-x-12 translate-y-[-110%] rounded-xl p-0.5 ring-foreground/10 shadow-xl shadow-black/30 ring-1"
                  >
                    <div className="bg-muted flex h-10 items-center gap-2.5 rounded-lg border px-3">
                      <AvatarImage
                        className="size-6 rounded-full"
                        alt="Shadcn avatar"
                        width={460}
                        height={460}
                        sizes="24px"
                        src="/images/avatar-124599.jpg"
                      />
                      <span className="text-muted-foreground block pl-px text-sm">
                        Send a cue msg..
                      </span>
                    </div>
                  </div>
                  <span>
                    <span className="bg-linear-to-r border-b-2 border-blue-400 from-blue-500 via-sky-500 to-purple-500 bg-clip-text py-1 text-transparent">
                      Keynote 09:30 am
                    </span>{" "}
                    is our stage timer cues.
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="bg-border h-1 w-full rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="bg-border h-1 w-2/3 rounded-full" />
                      <div className="bg-border h-1 w-1/3 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-border h-1 w-4/5 rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="bg-border h-1 w-2/5 rounded-full" />
                      <div className="bg-border h-1 w-1/5 rounded-full" />
                      <div className="bg-border h-1 w-1/5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="ring-foreground/6.5 bg-card text-card-foreground shadow ring-1 @xl:@max-3xl:col-start-2 @max-3xl:row-start-1 group grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8"
            >
              <div>
                <h3 className="text-foreground font-semibold">
                  Schedule Automation
                </h3>
                <p className="text-muted-foreground mt-3">
                  Trigger cues from timer, chain presets with live alerts.
                </p>
              </div>
              <div
                aria-hidden="true"
                className="bg-linear-to-b border-card -m-8 flex flex-col justify-center border-x from-transparent to-zinc-50"
              >
                <div
                  aria-hidden="true"
                  className="mask-radial-from-50% mask-radial-at-center mask-radial-to-[75%_50%] group relative -mx-8 max-md:-mx-6"
                >
                  <div className="grid grid-cols-5 items-center gap-2">
                    <div className="*:ring-foreground/10 grid h-full grid-rows-[1fr_auto_1fr] space-y-2 *:rounded-xl *:ring-1">
                      <div />
                      <div className="bg-card/50 h-36" />
                      <div />
                    </div>
                    <div className="col-span-3 grid grid-rows-[1fr_auto_1fr] space-y-2">
                      <div className="bg-card/50 ring-foreground/10 flex rounded-b-xl p-6 ring-1" />
                      <div className="relative">
                        <div className="bg-linear-to-r absolute inset-4 from-indigo-900/50 via-emerald-500 to-indigo-500 opacity-40 blur-xl" />
                        <div
                          data-slot="card"
                          aria-hidden="true"
                          className="ring-foreground/6.5 bg-card text-card-foreground rounded-xl ring-1 relative aspect-video p-4 shadow-xl shadow-black/10"
                        >
                          <div className="relative hidden h-fit">
                            <div className="absolute -left-1.5 bottom-1.5 rounded-md border-t border-red-700 bg-red-500 px-1 py-px text-[10px] font-medium text-white shadow-md shadow-red-500/35">
                              PDF
                            </div>
                            <div className="bg-linear-to-b h-10 w-8 rounded-md border from-zinc-100 to-zinc-200" />
                          </div>
                          <div className="mb-0.5 text-sm font-semibold">
                            Main Stage Keynote 
                          </div>
                          <div className="mb-4 flex gap-2 text-sm">
                            <span className="text-muted-foreground">
                              05:00 REMAIN  
                            </span>
                          </div>
                          <div className="mb-2 flex -space-x-1.5">
                            <div className="flex -space-x-1.5">
                              <div className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                <AvatarImage
                                  className="aspect-square rounded-full object-cover"
                                  alt="Méschac Irung"
                                  height={460}
                                  width={460}
                                  sizes="22px"
                                  src="/images/avatar-47919550.jpg"
                                />
                              </div>
                              <div className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                <AvatarImage
                                  className="aspect-square rounded-full object-cover"
                                  alt="Bernard Ngandu"
                                  height={460}
                                  width={460}
                                  sizes="22px"
                                  src="/images/avatar-31113941.jpg"
                                />
                              </div>
                              <div className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                <AvatarImage
                                  className="aspect-square rounded-full object-cover"
                                  alt="Théo Balick"
                                  height={460}
                                  width={460}
                                  sizes="22px"
                                  src="/images/avatar-68236786.jpg"
                                />
                              </div>
                              <div className="bg-background size-7 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                <AvatarImage
                                  className="aspect-square rounded-full object-cover"
                                  alt="Glodie Lukose"
                                  height={460}
                                  width={460}
                                  sizes="22px"
                                  src="/images/avatar-99137927.jpg"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-muted-foreground text-sm font-medium">
                            Speaker Wrap-Up Prompt
                          </div>
                        </div>
                      </div>
                      <div className="bg-card/50 ring-foreground/10 rounded-t-xl p-6 ring-1" />
                    </div>
                    <div className="*:ring-foreground/10 grid h-full grid-rows-[1fr_auto_1fr] space-y-2 *:rounded-xl *:ring-1">
                      <div />
                      <div className="bg-card/50 h-36" />
                      <div />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="ring-foreground/6.5 bg-card text-card-foreground shadow ring-1 group grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8"
            >
              <div>
                <h3 className="text-foreground font-semibold">
                  Instant Cue Messaging
                </h3>
                <p className="text-muted-foreground mt-3">
                  Send cues across displays, studio TVs, and monitors—every
                  alert syncs in real-time.
                </p>
              </div>
              <div
                aria-hidden="true"
                className="bg-linear-to-b border-background -m-8 flex flex-col justify-center border-x from-transparent to-zinc-50 p-8"
              >
                <div aria-hidden="true">
                  <div className="flex items-center gap-2">
                    <AvatarImage
                      className="size-6 rounded-full"
                      alt="Méschac Irung"
                      width={460}
                      height={460}
                      sizes="24px"
                      src="/images/avatar-47919550.jpg"
                    />
                    <span className="text-muted-foreground text-sm">
                      Stage Manager
                    </span>
                  </div>
                  <div className="bg-linear-to-b from-card ring-foreground/10 inset-ring inset-ring-background/50 ml-4 mt-2 w-fit rounded-b-2xl rounded-br-2xl rounded-tl rounded-tr-2xl to-sky-50 p-3 text-sm text-sky-950 shadow-md shadow-sky-600/10 ring-1">
                    Hey{" "}
                    <span className="text-foreground font-medium">
                      @speaker
                    </span>
                    , you&apos;ve got two minutes left to talk
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="ring-foreground/6.5 bg-card text-card-foreground shadow ring-1 group grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8"
            >
              <div>
                <h3 className="text-foreground font-semibold">
                  Studio‑grade reliability 
                </h3>
                <p className="text-muted-foreground mt-3">
                  Room‑code access, stage locks, and drift‑free sync keep
                  timing running smoothly on schedule.
                </p>
              </div>
              <div aria-hidden="true" className="relative mt-6">
                <div
                  data-slot="card"
                  className="ring-foreground/6.5 bg-card text-card-foreground rounded-xl ring-1 aspect-video w-4/5 translate-y-4 p-3 shadow-lg shadow-black/5 transition-transform duration-200 ease-in-out group-hover:-rotate-3"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="bg-background size-6 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                      <AvatarImage
                        className="aspect-square rounded-full object-cover"
                        alt="M Irung"
                        height={460}
                        width={460}
                        sizes="18px"
                        src="/images/avatar-47919550.jpg"
                      />
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Stage Manager
                    </span>
                    <span className="text-muted-foreground/75 text-xs">1m</span>
                  </div>
                  <div className="ml-8 space-y-2">
                    <div className="bg-foreground/10 h-2 rounded-full" />
                    <div className="bg-foreground/10 h-2 w-3/5 rounded-full" />
                    <div className="bg-foreground/10 h-2 w-1/2 rounded-full" />
                  </div>
                  <SignatureIcon className="lucide lucide-signature ml-8 mt-3 size-5" />
                </div>
                <div
                  data-slot="card"
                  className="ring-foreground/6.5 bg-card text-card-foreground rounded-xl ring-1 aspect-3/5 absolute -top-4 right-0 flex w-2/5 translate-y-4 p-2 shadow-lg shadow-black/5 transition-transform duration-200 ease-in-out group-hover:rotate-3"
                >
                  <div className="bg-foreground/5 m-auto flex size-10 rounded-full">
                    <PlayIcon className="lucide lucide-play fill-foreground/50 m-auto size-4 stroke-transparent" />
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="ring-foreground/6.5 bg-card text-card-foreground shadow ring-1 @xl:col-span-2 grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl px-8 pt-8"
            >
              <div className="max-w-md">
                <h3 className="text-foreground font-semibold">
                  Production Multi-Timer
                </h3>
                <p className="text-muted-foreground mt-3">
                  Keep presenters on schedule with synchronized confidence
                  monitors every live AV producer trusts.
                </p>
              </div>
              <div
                aria-hidden="true"
                className="mask-radial-from-65% mask-radial-to-85% relative"
              >
                <div className="absolute inset-6">
                  <div className="absolute left-1/3 top-1/3 z-10 size-8 -translate-x-full rounded-full bg-white p-0.5 shadow-md shadow-black/15">
                    <AvatarImage
                      className="aspect-square rounded-full object-cover"
                      alt="Glodie"
                      height={460}
                      width={460}
                      sizes="28px"
                      src="/images/avatar-99137927.jpg"
                    />
                  </div>
                  <div className="absolute right-1/2 top-1/2 z-10 size-8 -translate-y-full translate-x-full rounded-full bg-white p-0.5 shadow-md shadow-black/15">
                    <AvatarImage
                      className="aspect-square rounded-full object-cover"
                      alt="Theo"
                      height={460}
                      width={460}
                      sizes="28px"
                      src="/images/avatar-68236786.jpg"
                    />
                  </div>
                  <div className="absolute right-1/4 top-1/3 z-10 size-8 -translate-y-full translate-x-full rounded-full bg-white p-0.5 shadow-md shadow-black/15">
                    <AvatarImage
                      className="aspect-square rounded-full object-cover"
                      alt="Bernard"
                      height={460}
                      width={460}
                      sizes="28px"
                      src="/images/avatar-31113941.jpg"
                    />
                  </div>
                </div>
                <div className="isolate">
                  <AvatarImage
                    className="w-full"
                    alt="tailark map"
                    width={92}
                    height={44}
                    sizes="626px"
                    src="/images/tailark-map.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
