import type { Metadata } from "next";

import { geistMono, geistSans } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "StageTimer — Real-Time Stage Timer & Confidence Monitor",
  description:
    "Free professional online stage timer and confidence monitor for speakers, conferences, TV broadcasts, and live events. Zero-latency WebSocket sync.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "StageTimer — Real-Time Stage Timer & Confidence Monitor",
    description:
      "Free professional online stage timer and confidence monitor for speakers, conferences, and live events.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="quartz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white [--color-primary:var(--color-zinc-800)]">
        {children}
      </body>
    </html>
  );
}
