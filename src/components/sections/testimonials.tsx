import { Attribution } from "@/components/ui/attribution";
import { SectionIntro } from "@/components/ui/section-intro";

import { HuluLogo } from "@/components/brand/HuluLogo";
import { PrimeVideoLogo } from "@/components/brand/PrimeVideoLogo";
import { StripeLogo } from "@/components/brand/StripeLogo";
import { TailwindCssLogo } from "@/components/brand/TailwindCssLogo";

type Testimonial = {
  /**
   * Stable id for React keys. The reference repeats both a quote and an author
   * across two cards, so the copy below is duplicated deliberately — do not
   * "de-duplicate" it, that would change the rendered output.
   */
  id: string;
  logo: React.ReactNode;
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "tailwindcss",
    logo: <TailwindCssLogo className="h-7 w-36" fill="none" />,
    quote:
      "The real-time sync from StageTimer has been a game-changer for our stage production team. We can instantly run synchronized timers across all our confidence displays with zero latency. The interface is clean and the audio overtime alerts are exactly what we needed.",
    name: "Adam Wathan",
    role: "Lead AV Specialist",
    avatar: "/images/avatar-4323180.jpg",
  },
  {
    id: "prime-video",
    logo: <PrimeVideoLogo className="h-7 w-20" />,
    quote:
      "We needed a timing clock that could handle our high-stakes stage events while maintaining reliability. StageTimer delivered that - their multi-screen sync integrated seamlessly with our existing AV setup and helped us keep live panels strictly on schedule.",
    name: "Elena Rostova",
    role: "AV Stage Producer",
    avatar: "/images/avatar-99137927.jpg",
  },
  {
    id: "hulu",
    logo: <HuluLogo className="h-7 w-16" fill="none" />,
    quote:
      "Implementing StageTimer displays helped us create a calmer experience for keynote speakers. The responsive countdown system works flawlessly across screens, and we were able to prevent overtime overruns while keeping our entire AV stage team synced.",
    name: "Shadcn",
    role: "AV Technical Supervisor",
    avatar: "/images/avatar-124599.jpg",
  },
  {
    id: "stripe",
    logo: <StripeLogo className="h-7 w-16" />,
    quote:
      "The real-time sync from StageTimer has been a game-changer for our stage production team. We can instantly run synchronized timers across all our confidence displays with zero latency. The interface is clean and the audio overtime alerts are exactly what we needed.",
    name: "Elena Rostova",
    role: "AV Stage Producer",
    avatar: "/images/avatar-99137927.jpg",
  },
];

const CARD_CLASSES =
  "bg-card text-card-foreground ring-1 ring-foreground/10 lg:nth-3:ml-8 md:nth-3:shadow-none md:nth-3:bg-transparent md:nth-2:shadow-none md:nth-2:bg-transparent md:nth-2:col-start-2 md:nth-2:row-start-2 relative space-y-8 rounded-2xl p-10 shadow-lg shadow-black/5 first:col-start-1 first:row-start-1 md:row-span-2";

const QUOTE_CLASSES =
  "text-lg before:mr-1 before:font-serif before:content-['“'] after:ml-1 after:font-serif after:content-['”']";

export function Testimonials() {
  return (
    <section className="pb-44 pt-24">
      <div className="mx-auto w-full max-w-5xl px-6">
        <SectionIntro
          eyebrow="Testimonials"
          title="Trusted by AV pros now"
          description="Join the growing community of producers and AV directors who rely on StageTimer for seamless and reliable live timing."
        />
        <div className="mt-16 grid gap-2 sm:gap-6 md:grid-cols-2 md:grid-rows-5 lg:-mx-8 lg:gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              data-slot="card"
              className={CARD_CLASSES}
              style={{ touchAction: "none" }}
            >
              <div>{t.logo}</div>
              <p className={QUOTE_CLASSES}>{t.quote}</p>
              <Attribution
                name={t.name}
                role={t.role}
                avatar={t.avatar}
                alt={`Avatar of ${t.name}`}
              />
            </div>
          ))}
          <div
            aria-hidden="true"
            className="ring-border-illustration col-start-2 row-start-1 w-2/3 rounded-2xl ring max-md:hidden"
          />
          <div
            aria-hidden="true"
            className="ring-border-illustration ml-auto h-2/3 w-2/3 rounded-2xl ring max-md:hidden"
          />
        </div>
      </div>
    </section>
  );
}
