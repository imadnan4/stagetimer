import { Reveal } from "@/components/ui/reveal";

export function Pricing() {
  const freeFeatures = [
    "5 free rooms can be created",
    "Real-time countdown & count-up",
    "Zero-latency WebSocket sync",
    "Up to 3 connected displays",
    "Mobile & tablet remote control",
    "Overtime & warning color alerts",
  ];

  const proFeatures = [
    "Everything in Free plan",
    "Unlimited rooms & stage sessions",
    "Lifetime access with zero monthly fees",
    "Unlimited connected stage monitors",
    "Custom stage messages & cue flash",
    "Broadcast audio chimes at 00:00",
    "Light & dark stage lights themes",
    "Priority AV support",
  ];

  return (
    <section id="pricing" data-theme="quartz" className="relative py-24 sm:py-32 overflow-hidden bg-zinc-50/70 border-t border-b border-zinc-200/80">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Reveal delay={0} y={12} blur={4}>
            <span className="font-mono text-xs uppercase tracking-widest text-sky-600 font-semibold block mb-3">
              Transparent Pricing
            </span>
          </Reveal>
          <Reveal delay={80} y={18} blur={6}>
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
              Simple pricing, unlimited stage control
            </h2>
          </Reveal>
          <Reveal delay={160} y={16} blur={4}>
            <p className="mt-4 text-lg text-zinc-600 text-balance">
              Choose the plan that fits your live events. Keep speakers on schedule with zero setup friction.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-center max-w-3xl mx-auto">
          {/* Free Plan */}
          <Reveal delay={100} y={24} blur={6} className="h-full flex flex-col">
            <div className="w-full h-full rounded-[32px] p-1 flex flex-col transition-all duration-300 hover:-translate-y-1 border border-zinc-200 bg-zinc-100 shadow-md shadow-zinc-200/50">
            <div className="flex items-center justify-between px-5 py-3 text-zinc-600">
              <p className="text-xs font-bold tracking-widest uppercase font-mono">
                FREE PLAN
              </p>
              <span className="text-xs font-mono font-medium text-zinc-500">5 Rooms Free</span>
            </div>

            <div className="w-full h-full bg-white rounded-[28px] p-6 sm:p-7 flex flex-col gap-4 text-zinc-600 text-xs shadow-xs">
              <p className="font-semibold text-sm tracking-wider uppercase text-zinc-500 font-mono">
                Starter
              </p>
              <div className="flex items-baseline gap-1.5 text-zinc-950">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight font-sans">$0</span>
                <span className="text-sm font-medium text-zinc-500">/ month</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed min-h-[38px]">
                Essential stage clock controls for individual speakers and trial runs.
              </p>

              <a
                href="/control"
                className="block text-center py-2.5 px-4 rounded-xl text-sm font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start For Free
              </a>

              <div className="flex items-center gap-2.5 w-full text-[10px] font-mono tracking-wider text-zinc-400 my-1">
                <div className="flex-1 h-px bg-zinc-200" />
                <p className="font-semibold uppercase">FEATURES</p>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              <div className="flex flex-col gap-3 text-xs sm:text-sm text-zinc-700">
                {freeFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0 text-sky-500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                      >
                        <rect rx={4} y={3} x={3} height={18} width={18} />
                        <path d="m9 12l2.25 2L15 10" />
                      </g>
                    </svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Pro Lifetime Plan */}
        <Reveal delay={220} y={24} blur={6} className="h-full flex flex-col">
          <div
            className="w-full h-full rounded-[32px] p-1 flex flex-col transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-sky-500/20"
            style={{
              background:
                "linear-gradient(135deg, #1d4ed8 0%, #38bdf8 45%, #2563eb 75%, #1e40af 100%)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3 text-white">
              <p className="text-xs font-bold tracking-widest uppercase italic font-mono drop-shadow-[0_2px_4px_rgba(29,78,216,0.8)]">
                MOST POPULAR
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              >
                <path
                  fill="currentColor"
                  d="M10.277 16.515c.005-.11.187-.154.24-.058c.254.45.686 1.111 1.177 1.412c.49.3 1.275.386 1.791.408c.11.005.154.186.058.24c-.45.254-1.111.686-1.412 1.176s-.386 1.276-.408 1.792c-.005.11-.187.153-.24.057c-.254-.45-.686-1.11-1.176-1.411s-1.276-.386-1.792-.408c-.11-.005-.153-.187-.057-.24c.45-.254 1.11-.686 1.411-1.177c.301-.49.386-1.276.408-1.791m8.215-1c-.008-.11-.2-.156-.257-.062c-.172.283-.421.623-.697.793s-.693.236-1.023.262c-.11.008-.155.2-.062.257c.283.172.624.42.793.697s.237.693.262 1.023c.009.11.2.155.258.061c.172-.282.42-.623.697-.792s.692-.237 1.022-.262c.11-.009.156-.2.062-.258c-.283-.172-.624-.42-.793-.697s-.236-.692-.262-1.022M14.704 4.002l-.242-.306c-.937-1.183-1.405-1.775-1.95-1.688c-.545.088-.806.796-1.327 2.213l-.134.366c-.149.403-.223.604-.364.752c-.143.148-.336.225-.724.38l-.353.141l-.248.1c-1.2.48-1.804.753-1.881 1.283c-.082.565.49 1.049 1.634 2.016l.296.25c.325.275.488.413.58.6c.094.187.107.403.134.835l.024.393c.093 1.52.14 2.28.634 2.542s1.108-.147 2.336-.966l.318-.212c.35-.233.524-.35.723-.381c.2-.032.402.024.806.136l.368.102c1.422.394 2.133.591 2.52.188c.388-.403.196-1.14-.19-2.613l-.099-.381c-.11-.419-.164-.628-.134-.835s.142-.389.365-.752l.203-.33c.786-1.276 1.179-1.914.924-2.426c-.254-.51-.987-.557-2.454-.648l-.379-.024c-.417-.026-.625-.039-.806-.135c-.18-.096-.314-.264-.58-.6m-5.869 9.324C6.698 14.37 4.919 16.024 4.248 18c-.752-4.707.292-7.747 1.965-9.637c.144.295.332.539.5.73c.35.396.852.82 1.362 1.251l.367.31l.17.145c.005.064.01.14.015.237l.03.485c.04.655.08 1.294.178 1.805"
                />
              </svg>
            </div>

            <div className="w-full h-full bg-white rounded-[28px] p-6 sm:p-7 flex flex-col gap-4 text-zinc-600 text-xs shadow-xs">
              <p className="font-semibold text-sm tracking-wider uppercase text-zinc-500 font-mono">
                Professional
              </p>
              <div className="flex items-baseline gap-1.5 text-zinc-950">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight font-sans">$5</span>
                <span className="text-sm font-medium text-zinc-500">/ lifetime</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed min-h-[38px]">
                Full professional confidence monitor suite for AV crews and events.
              </p>

              <a
                href="/control"
                className="btn-donate block text-center py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-sky-500/25"
              >
                Get Lifetime Access
              </a>

              <div className="flex items-center gap-2.5 w-full text-[10px] font-mono tracking-wider text-zinc-400 my-1">
                <div className="flex-1 h-px bg-zinc-200" />
                <p className="font-semibold uppercase">FEATURES</p>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              <div className="flex flex-col gap-3 text-xs sm:text-sm text-zinc-700">
                {proFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0 text-sky-500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                      >
                        <rect rx={4} y={3} x={3} height={18} width={18} />
                        <path d="m9 12l2.25 2L15 10" />
                      </g>
                    </svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      </div>
    </section>
  );
}
