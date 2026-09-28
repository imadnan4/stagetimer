import type { Metadata } from "next";
import Link from "next/link";

import { StageTimerLogo } from "@/components/brand/StageTimerLogo";
import { SiteFooter } from "@/components/sections/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms of service governing your use of StageTimer, including room creation allowances, lifetime access, and usage guidelines.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | StageTimer",
    description:
      "The terms of service governing your use of StageTimer, including room creation allowances, lifetime access, and usage guidelines.",
    url: "/terms",
  },
};

const CONTACT_EMAIL = "priadn544@gmail.com";

export default function TermsOfService() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-6 py-24 [--color-primary:var(--color-zinc-800)]">
        <Link aria-label="StageTimer home" href="/" className="inline-block">
          <StageTimerLogo />
        </Link>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight text-zinc-950">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: September 27, 2026</p>

        <div className="mt-10 space-y-6 text-zinc-700 leading-relaxed">
          <h2 className="text-xl font-semibold text-zinc-950">1. Acceptance</h2>
          <p>
            By accessing or using StageTimer you agree to these terms. If you do not
            agree, please do not use the service.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">2. The service</h2>
          <p>
            StageTimer provides a browser-based presentation timer with one controller
            and one or more synchronized displays. The service is provided on an
            &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">3. Accounts and free tier</h2>
          <p>
            You may create a limited number of timer rooms without an account. Creating
            an account lets you keep using the service, and a one-time payment unlocks
            unlimited rooms and features for life, as described on the pricing page.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">4. Payments</h2>
          <p>
            Payments are processed by Polar as Merchant of Record. Purchases are for a
            lifetime licence to the paid features and are not subscriptions. Refunds are
            handled by Polar in accordance with their policies and applicable law.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">5. Acceptable use</h2>
          <p>
            You agree not to misuse the service, including by attempting to bypass
            usage limits, disrupting the service, or using it in violation of any law.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">6. Intellectual property</h2>
          <p>
            StageTimer and its source code are licensed under the MIT License. The
            StageTimer name and logo remain the property of their owner.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">7. Disclaimer and liability</h2>
          <p>
            To the maximum extent permitted by law, the service is provided without
            warranties, and we are not liable for any indirect or consequential damages
            arising from your use of the service.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">8. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use after changes
            take effect constitutes acceptance of the updated terms.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">9. Contact</h2>
          <p>
            Questions about these terms? Email us at{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
