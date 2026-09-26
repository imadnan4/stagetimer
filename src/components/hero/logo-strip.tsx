import type { SVGProps } from "react";

import { BeaconLogo } from "@/components/brand/BeaconLogo";
import { HuluLogo } from "@/components/brand/HuluLogo";
import { SpotifyLogo } from "@/components/brand/SpotifyLogo";
import { StripeLogo } from "@/components/brand/StripeLogo";
import { SupabaseLogo } from "@/components/brand/SupabaseLogo";
import { TailwindCssLogo } from "@/components/brand/TailwindCssLogo";
import { VercelLogo } from "@/components/brand/VercelLogo";

type LogoComponent = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

/**
 * The eight brand marks, in the reference's exact order and intrinsic sizes.
 * The container's `**:fill-foreground` is a CSS rule that beats each path's
 * `fill` presentation attribute, which is why the whole strip renders
 * monochrome — reproduce that, don't "fix" it.
 */
const LOGOS: { Logo: LogoComponent; h: number }[] = [
  { Logo: HuluLogo, h: 16 },
  { Logo: SpotifyLogo, h: 22 },
  { Logo: SupabaseLogo, h: 20 },
  { Logo: BeaconLogo, h: 16 },
  { Logo: VercelLogo, h: 16 },
  { Logo: StripeLogo, h: 20 },
  { Logo: TailwindCssLogo, h: 20 },
  { Logo: StripeLogo, h: 20 },
];

export function LogoStrip() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="**:fill-foreground grid grid-cols-3 items-center gap-y-12 sm:grid-cols-4">
        {LOGOS.map(({ Logo, h }, i) => (
          <div
            key={i}
            className={
              i === 0
                ? "flex h-full items-center justify-center px-2"
                : "flex items-center justify-center px-2"
            }
          >
            <Logo height={h} width="auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
