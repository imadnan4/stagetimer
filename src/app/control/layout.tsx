import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timer Controller & Operator Dashboard",
  description:
    "Control your stage timer in real time. Start, pause, adjust countdowns, send instant speaker alerts, and share synchronized confidence monitor displays.",
  alternates: {
    canonical: "/control",
  },
  openGraph: {
    title: "Timer Controller & Operator Dashboard | StageTimer",
    description:
      "Control your stage timer in real time. Start, pause, adjust countdowns, send instant speaker alerts, and share synchronized confidence monitor displays.",
    url: "/control",
  },
  twitter: {
    title: "Timer Controller & Operator Dashboard | StageTimer",
    description:
      "Control your stage timer in real time. Start, pause, adjust countdowns, send instant speaker alerts, and share synchronized confidence monitor displays.",
  },
};

export default function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
