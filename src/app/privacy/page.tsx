import type { Metadata } from "next";
import Link from "next/link";

import { StageTimerLogo } from "@/components/brand/StageTimerLogo";
import { SiteFooter } from "@/components/sections/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — StageTimer",
  description:
    "How StageTimer collects, uses, and protects your information when you use the real-time stage timer.",
};

const CONTACT_EMAIL = "priadn544@gmail.com";

export default function PrivacyPolicy() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-6 py-24 [--color-primary:var(--color-zinc-800)]">
        <Link aria-label="StageTimer home" href="/" className="inline-block">
          <StageTimerLogo />
        </Link>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight text-zinc-950">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: September 27, 2026</p>

        <div className="mt-10 space-y-6 text-zinc-700 leading-relaxed">
          <p>
            StageTimer (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a real-time
            presentation timer and confidence monitor available at{" "}
            <a className="underline" href="https://stage-timer-remotely.netlify.app">
              stage-timer-remotely.netlify.app
            </a>
            . This policy explains what information we collect, why we collect it,
            and the choices you have.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">Information we collect</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Account information.</strong> If you sign in, we receive your
              name, email address and profile identifier from your sign-in provider
              (Google) or from the email address and password you register with.
            </li>
            <li>
              <strong>Usage information.</strong> To provide the free tier we record
              how many timer rooms are created against a hashed identifier derived
              from your IP address and an anonymous device identifier stored in your
              browser. These identifiers are hashed and are not used to identify you
              personally.
            </li>
            <li>
              <strong>Purchase information.</strong> Payments are processed by Polar
              as Merchant of Record. We receive the order status, product, amount,
              currency and the email address associated with the purchase. We never
              receive or store your full card details.
            </li>
            <li>
              <strong>Technical information.</strong> Our hosting providers process
              standard server logs (such as IP address, user agent and timestamps)
              needed to operate and secure the service.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-zinc-950">How we use information</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>To authenticate you and maintain your session.</li>
            <li>To operate the timer, displays and controller synchronization.</li>
            <li>To enforce the free-tier limits and grant lifetime access you paid for.</li>
            <li>To respond to support requests and keep the service secure.</li>
          </ul>

          <h2 className="text-xl font-semibold text-zinc-950">Cookies and local storage</h2>
          <p>
            We use a session cookie set by our authentication provider to keep you
            signed in, and browser local storage to remember your theme preference
            and an anonymous device identifier used for free-tier metering. We do
            not use advertising cookies.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">Service providers</h2>
          <p>
            We share information with the following processors strictly to run the
            service: Neon (database and authentication), Polar (payments), Netlify
            (frontend hosting) and Heroku (backend hosting).
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">Data retention</h2>
          <p>
            Account information is kept while your account exists. Free-tier usage
            counters and lifetime entitlements are retained as long as needed to
            operate the service. You may request deletion of your account at any
            time.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">Your rights</h2>
          <p>
            Depending on where you live, you may have the right to access, correct,
            export or delete your personal information. To make a request, contact us
            at <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">Children</h2>
          <p>
            StageTimer is not directed to children under 13, and we do not knowingly
            collect personal information from them.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be
            reflected by updating the date at the top of this page.
          </p>

          <h2 className="text-xl font-semibold text-zinc-950">Contact</h2>
          <p>
            Questions about this policy? Email us at{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
