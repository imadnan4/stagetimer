import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stage Confidence Monitor & Speaker Display",
  description:
    "Full-screen stage timer display and confidence monitor for speakers, presenters, and stage crew. Real-time countdown sync with high-contrast visibility and overtime alerts.",
  alternates: {
    canonical: "/display",
  },
  openGraph: {
    title: "Stage Confidence Monitor & Speaker Display | StageTimer",
    description:
      "Full-screen stage timer display and confidence monitor for speakers, presenters, and stage crew. Real-time countdown sync with high-contrast visibility and overtime alerts.",
    url: "/display",
    images: [
      {
        url: "/images/stage_confidence_monitor.jpg",
        width: 1376,
        height: 768,
        alt: "StageTimer Speaker Confidence Monitor Display",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stage Confidence Monitor & Speaker Display | StageTimer",
    description:
      "Full-screen stage timer display and confidence monitor for speakers, presenters, and stage crew. Real-time countdown sync with high-contrast visibility and overtime alerts.",
    images: ["/images/stage_confidence_monitor.jpg"],
  },
};

export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
