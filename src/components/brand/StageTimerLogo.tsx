import type { SVGProps } from "react";

export function StageTimerMark({
  className = "size-7",
  stroke = "#2563eb",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2.05"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-timer shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <line x1="10" x2="14" y1="2" y2="2" />
      <line x1="12" x2="12" y1="2" y2="6" />
      <line x1="12" x2="15" y1="14" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  );
}

export function StageTimerLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <StageTimerMark className="size-7 -translate-y-px" />
      <span className="font-sans font-medium text-xl tracking-tight text-black leading-none">
        StageTimer
      </span>
    </div>
  );
}
