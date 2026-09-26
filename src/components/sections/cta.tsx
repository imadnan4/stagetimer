import { ButtonAnchor } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/**
 * The CTA's backdrop is pure CSS art. Three dot variants appear:
 * rounded gradient pills in the dock chrome, `bg-card` + ring squares in the
 * sidebar header, and flat gradient squares in the sidebar footer.
 */
type DotFill =
  | "bg-linear-to-b to-card/50 size-full rounded-full border"
  | "bg-linear-to-b to-card/50 size-full border"
  | "bg-card ring-border size-full ring-1";

function DotColumn({ fill }: { fill: DotFill }) {
  return (
    <div className="space-y-1">
      {[0, 1].map((i) => (
        <div key={i} className="size-3 border p-0.5">
          <div className={fill} />
        </div>
      ))}
    </div>
  );
}

const PILL_FILL: DotFill =
  "bg-linear-to-b to-card/50 size-full rounded-full border";
const SQUARE_FILL: DotFill = "bg-linear-to-b to-card/50 size-full border";
const RING_FILL: DotFill = "bg-card ring-border size-full ring-1";

/**
 * Ten (`w-28`) or five (`w-16`) tiny "battery" glyphs. Only the cluster in
 * the middle column omits `justify-end`; the other three are right-aligned.
 */
function BarCluster({
  count,
  justifyEnd = true,
}: {
  count: 10 | 5;
  justifyEnd?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={
        "scale-85 flex " +
        (count === 10 ? "w-28 " : "w-16 ") +
        "flex-wrap " +
        (justifyEnd ? "justify-end " : "") +
        "gap-2.5 opacity-75"
      }
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="h-5 w-2.5 max-sm:last:hidden"
        >
          <div className="bg-card rounded-t-xs ring-foreground/5 h-1.5 shadow ring-1" />
          <div className="bg-foreground/5 border-foreground/10 relative mx-auto h-2 w-2 border-x" />
          <div className="bg-card rounded-b-xs ring-foreground/5 h-1.5 shadow ring-1" />
        </div>
      ))}
    </div>
  );
}

const DOCK_LABEL =
  "**:rounded-full flex w-full flex-wrap justify-end gap-1 rounded border p-4";

function DockLabel() {
  return (
    <div className={DOCK_LABEL}>
      <DotColumn fill={PILL_FILL} />
      <DotColumn fill={PILL_FILL} />
      <DotColumn fill={PILL_FILL} />
      <span className="w-full pt-6 font-mono text-[10px] uppercase">
        Experience live stage timing.
      </span>
    </div>
  );
}

const TILE_CORNERS = [
  "rounded-l-lg",
  "rounded-r-lg",
  "rounded-l-lg",
  "rounded-r-lg",
];

const scan = (spacing: 2 | 3) =>
  `bg-[repeating-linear-gradient(90deg,var(--color-border-illustration),var(--color-border-illustration)_1px,transparent_1px,transparent_${spacing}px)]`;

/** The two 32px/20px placeholder text bars used in the dashboard art. */
function Scanlines() {
  return (
    <div className="space-y-2 py-2">
      <div className={`h-2 w-32 ${scan(2)}`} />
      <div className={`h-2 w-20 ${scan(2)}`} />
    </div>
  );
}

/** The vertical 3px-pitch scanline column on the right of two tiles. */
function VerticalScan() {
  return (
    <div className={`mask-b-from-75% -mt-4 ml-auto h-20 w-6 ${scan(3)}`} />
  );
}

export function Cta() {
  return (
    <section className="relative border-b">
      <div className="mask-b-from-65% absolute inset-0">
        <div className="max-lg:hidden">
          <div className="relative [--color-border-illustration:--alpha(var(--color-zinc-950)/10%)] [--color-border:--alpha(var(--color-zinc-950)/10%)]">
            <div className="h-120 relative mx-auto grid max-w-6xl grid-cols-3 overflow-hidden rounded-2xl lg:px-12">
              <div className="grid grid-cols-2 pr-6">
                <div className="grid h-full grid-rows-3 border-r">
                  <div className="flex flex-col justify-end p-6">
                    <DockLabel />
                  </div>
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-l-2xl border-y border-l p-2">
                    {TILE_CORNERS.map((c, i) => (
                      <div
                        key={i}
                        className={`bg-linear-to-b to-card/75 ring-border size-full rounded ${c} ring-1`}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid h-full grid-rows-3 p-6">
                  <div>
                    <BarCluster count={10} justifyEnd={false} />
                  </div>
                  <div className="mr-auto p-6">
                    <div className="flex gap-1">
                      <div className="size-7 border p-1">
                        <div className={RING_FILL} />
                      </div>
                      <DotColumn fill={RING_FILL} />
                    </div>
                    <div className="space-y-2 py-2">
                      <div className={`h-1 w-12 ${scan(3)}`} />
                      <div className="flex justify-between gap-4">
                        <div className={`h-1.5 w-6 ${scan(3)}`} />
                        <div className={`h-1.5 w-10 ${scan(3)}`} />
                      </div>
                    </div>
                    <div className="flex justify-between gap-1">
                      <DotColumn fill={SQUARE_FILL} />
                      <DotColumn fill={SQUARE_FILL} />
                      <DotColumn fill={SQUARE_FILL} />
                    </div>
                  </div>
                </div>
              </div>

              <div />

              <div className="grid grid-rows-[1fr_auto]">
                <div className="grid grid-cols-2 pl-6">
                  <div className="flex h-full flex-col items-center justify-between p-4">
                    <div className="flex flex-col justify-center">
                      <Scanlines />
                      <div className="flex">
                        <BarCluster count={5} />
                        <VerticalScan />
                      </div>
                    </div>
                    <DockLabel />
                    <div>
                      <BarCluster count={10} />
                    </div>
                  </div>
                  <div className="relative grid h-full grid-rows-2 border-l">
                    <div className="m-2 bg-[repeating-linear-gradient(45deg,var(--color-border-illustration),var(--color-border-illustration)_1px,transparent_1px,transparent_6px)]" />
                    <div className="-mb-2 flex flex-col justify-center rounded-r-xl border-y border-r p-6">
                      <Scanlines />
                      <div className="flex">
                        <BarCluster count={5} />
                        <VerticalScan />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative pb-2 pr-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden p-8 md:px-32 md:py-20">
          <div className="relative text-center">
            <Reveal delay={0} y={18} blur={6}>
              <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Direct, Cue and Time!
              </h2>
            </Reveal>
            <Reveal delay={100} y={16} blur={4}>
              <p className="text-muted-foreground mb-6 mt-4 text-balance">
                Join a community of over 1000+ event producers and AV crews who 
                already run their shows with StageTimer.{" "}
              </p>
            </Reveal>
            <Reveal delay={200} y={14} blur={4}>
              <ButtonAnchor href="/control" variant="primary" size="md">
                Start A Timer
              </ButtonAnchor>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
