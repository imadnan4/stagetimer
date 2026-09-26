"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";

/**
 * The reference plots two stacked area series ("a") over a 6-point category
 * axis. The leading "May" label is wider than the room left of the plot
 * origin, so recharts drops that tick and only five render, at plot positions
 * 1..5. Values are absolute, so the implicit stacked Y domain is [0, 1200].
 */
const DATA = [
  { month: "May", desktop: 56, mobile: 224 },
  { month: "June", desktop: 56, mobile: 224 },
  { month: "January", desktop: 126, mobile: 252 },
  { month: "February", desktop: 205, mobile: 410 },
  { month: "March", desktop: 200, mobile: 126 },
  { month: "April", desktop: 400, mobile: 800 },
];

const CHART_CLASSES =
  "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden flex justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-sector[stroke='#fff']]:stroke-transparent aspect-auto h-72";

export function PricingChart() {
  return (
    <div
      data-slot="chart"
      data-chart="chart-pricing-analytics"
      className={CHART_CLASSES}
    >
      <style>{`
        [data-chart="chart-pricing-analytics"] {
          --color-desktop: var(--color-emerald-500);
          --color-mobile: var(--color-indigo-400);
        }
      `}</style>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={DATA}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.8}
              />
              <stop
                offset="55%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-mobile)"
                stopOpacity={0.8}
              />
              <stop
                offset="55%"
                stopColor="var(--color-mobile)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="var(--color-muted)" />
          <Area
            strokeWidth={1}
            dataKey="mobile"
            type="natural"
            fill="url(#fillMobile)"
            fillOpacity={0.1}
            stroke="var(--color-mobile)"
            isAnimationActive={false}
            stackId="a"
          />
          <Area
            strokeWidth={1}
            dataKey="desktop"
            type="natural"
            fill="url(#fillDesktop)"
            fillOpacity={0.1}
            stroke="var(--color-desktop)"
            isAnimationActive={false}
            stackId="a"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
