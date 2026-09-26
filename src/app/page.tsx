import { Header } from "@/components/header/header";
import { Hero } from "@/components/hero/hero";
import { Benefits } from "@/components/sections/benefits";
import { Cta } from "@/components/sections/cta";
import { Features } from "@/components/sections/features";
import { SiteFooter } from "@/components/sections/footer";
import { Pricing } from "@/components/sections/pricing";
import { Process } from "@/components/sections/process";
import { PullQuote } from "@/components/sections/pull-quote";
import { Testimonials } from "@/components/sections/testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-background [--color-primary:var(--color-indigo-500)]">
        <section>
          <Hero />
        </section>
        <Features />
        <Benefits />
        <PullQuote />
        <Process />
        <Testimonials />
        <Pricing />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
