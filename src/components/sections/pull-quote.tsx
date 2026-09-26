import { Attribution } from "@/components/ui/attribution";
import { QuoteIcon } from "@/components/icons";
import { Reveal } from "@/components/ui/reveal";

export function PullQuote() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl">
          <Reveal delay={0} y={12} blur={4}>
            <QuoteIcon className="lucide lucide-quote fill-card stroke-card size-5 drop-shadow-md" />
          </Reveal>
          <Reveal delay={100} y={20} blur={6} duration={850}>
            <p className="my-12 text-lg font-medium sm:text-xl md:text-3xl md:leading-10">
              Using StageTimer has been like unlocking live timing superpowers.
              It&apos;s the perfect fusion of simplicity and reliability, enabling
              us to run shows that are as seamless as they are always on-time.
            </p>
          </Reveal>
          <Reveal delay={200} y={16} blur={4}>
            <Attribution
              name="Lucas Vance AV"
              role="AV Director"
              avatar="/images/avatar-47919550.jpg"
              alt="Avatar of Lucas V"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
