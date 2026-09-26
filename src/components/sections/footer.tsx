import Link from "next/link";

import { ChatGptIcon } from "@/components/brand/ChatGptIcon";
import { ClaudeIcon } from "@/components/brand/ClaudeIcon";
import { StageTimerLogo } from "@/components/brand/StageTimerLogo";
import { GeminiIcon } from "@/components/brand/GeminiIcon";
import { PerplexityIcon } from "@/components/brand/PerplexityIcon";
import { footerSections } from "@/lib/navigation";

const SOCIALS = [
  { label: "Claude AI", Icon: ClaudeIcon, className: undefined },
  { label: "ChatGPT", Icon: ChatGptIcon, className: undefined },
  {
    label: "Perplexity",
    Icon: PerplexityIcon,
    className: "size-5! *:fill-transparent!",
  },
  { label: "Gemini", Icon: GeminiIcon, className: undefined },
];

const SOCIAL_LINK =
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9";

export function SiteFooter() {
  return (
    <footer className="bg-card">
      <div className="mx-auto max-w-5xl space-y-16 px-6 pb-12 pt-32">
        <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-full lg:col-span-3">
            <Link aria-label="StageTimer home" href="/">
              <StageTimerLogo />
            </Link>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <span className="text-foreground text-sm font-medium">
                {section.title}
              </span>
              <ul className="mt-4 list-inside space-y-4">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      className="hover:text-primary text-muted-foreground text-sm duration-150"
                      href={link.href}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          className="bg-size-[6px_1px] my-12 h-px bg-[linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] bg-repeat-x opacity-35"
        />

        <div className="grid gap-x-3 gap-y-6 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">
              Get an AI summary of this page
            </p>
            <div className="**:fill-foreground -ml-2.5 mt-2 flex items-center">
              {SOCIALS.map(({ label, Icon, className }) => (
                <a
                  key={label}
                  aria-label={label}
                  title={label}
                  href="#"
                  className={SOCIAL_LINK}
                >
                  <Icon className={className} />
                </a>
              ))}
            </div>
          </div>
          <span className="text-muted-foreground block text-xs">
            Copyright © 2026 StageTimer Inc. All rights reserved. <br /> StageTimer™,
            and the StageTimer logo are marks of StageTimer Inc. Trademark
            applications are pending in the United States and other
            jurisdictions.
          </span>
        </div>
      </div>
    </footer>
  );
}
