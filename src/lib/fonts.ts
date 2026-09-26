import localFont from "next/font/local";

export const geistSans = localFont({
  src: "../../public/fonts/geist-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["Arial"],
  adjustFontFallback: "Arial",
});

export const geistMono = localFont({
  src: "../../public/fonts/geist-mono-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-geist-mono",
  display: "swap",
  fallback: ["Arial"],
  adjustFontFallback: "Arial",
});
