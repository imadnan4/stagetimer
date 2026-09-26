# Stage Timer Landing Page Migration & Integration Plan

## Overview
This document tracks the discovery, copying, placement, and verification of all components, styles, utilities, and assets from the modern landing page template in `../stripe` to the `stagetimer` project.

---

## 1. Inventory of Components and Files to Bring Over

### 1.1 Styles & Tokens
- [x] `app/globals.css` (Tailwind 4 theme variables, quartz & dark theme definitions, radial/linear masks, keyframes)

### 1.2 Library & Utilities
- [x] `src/lib/utils.ts` (`cn` helper combining `clsx` and `tailwind-merge`)
- [x] `src/lib/fonts.ts` (Geist font configuration)
- [x] `src/lib/nav-metrics.ts` (Measured nav dropdown metrics and scroll threshold)
- [x] `src/lib/navigation.ts` (Header, mobile, and footer navigation data)

### 1.3 Base UI Components
- [x] `src/components/ui/button.tsx` (Quartz/Stripe button variants and sizing)
- [x] `src/components/ui/avatar-image.tsx` (Optimized fallback avatar image component)
- [x] `src/components/ui/section-intro.tsx` (Standardized section title and subtitle hierarchy)
- [x] `src/components/ui/attribution.tsx` (Testimonial attribution component)

### 1.4 Icons & Brand Assets
- [x] `src/components/icons.tsx` (Vendored crisp SVG icons)
- [x] `src/components/brand/NavIcons.tsx` (Navigation dropdown category icons)
- [x] `src/components/brand/StripeLogo.tsx`
- [x] `src/components/brand/HuluLogo.tsx`
- [x] `src/components/brand/SpotifyLogo.tsx`
- [x] `src/components/brand/SupabaseLogo.tsx`
- [x] `src/components/brand/BeaconLogo.tsx`
- [x] `src/components/brand/VercelLogo.tsx`
- [x] `src/components/brand/TailwindCssLogo.tsx`
- [x] `src/components/brand/PrimeVideoLogo.tsx`
- [x] `src/components/brand/BenefitsWave.tsx`
- [x] `src/components/brand/ProcessWave.tsx`
- [x] `src/components/brand/FooterBrand.tsx`
- [x] `src/components/brand/ClaudeIcon.tsx`
- [x] `src/components/brand/ChatGptIcon.tsx`
- [x] `src/components/brand/PerplexityIcon.tsx`
- [x] `src/components/brand/GeminiIcon.tsx`

### 1.5 Header & Hero Sections
- [x] `src/components/header/header.tsx` (Interactive dynamic navbar with animated desktop mega-menu & mobile drawer)
- [x] `src/components/hero/hero.tsx` (Hero banner with badge, CTA buttons, and app screenshot display)
- [x] `src/components/hero/logo-strip.tsx` (Social proof logo strip)

### 1.6 Feature, Process & Content Sections
- [x] `src/components/features/pricing-chart.tsx` (Recharts interactive analytics/pricing component)
- [x] `src/components/sections/features.tsx` (Main features bento grid)
- [x] `src/components/sections/benefits.tsx` (Dark/light benefit callout cards with wave illustrations)
- [x] `src/components/sections/pull-quote.tsx` (High-impact quote section)
- [x] `src/components/sections/process.tsx` (Step-by-step workflow guide)
- [x] `src/components/sections/testimonials.tsx` (User testimonials grid with avatars)
- [x] `src/components/sections/cta.tsx` (Final conversion call-to-action banner)
- [x] `src/components/sections/footer.tsx` (Comprehensive footer with links and branding)

### 1.7 Public Static Assets
- [x] `public/images/avatar-*.jpg` (Customer testimonial avatars)
- [x] `public/images/tailark-map.svg` (Global infrastructure vector map)
- [x] `public/images/app-screenshot.png` (App showcase screenshot)
- [x] `public/fonts/geist-latin.woff2` & `public/fonts/geist-mono-latin.woff2`

---

## 2. Execution Log

| Component / File | Source Path | Target Destination | Status |
| :--- | :--- | :--- | :--- |
| `globals.css` | `../stripe/app/globals.css` | `src/app/globals.css` | Complete |
| `utils.ts` | `../stripe/lib/utils.ts` | `src/lib/utils.ts` | Complete |
| `fonts.ts` | `../stripe/lib/fonts.ts` | `src/lib/fonts.ts` | Complete |
| `nav-metrics.ts` | `../stripe/lib/nav-metrics.ts` | `src/lib/nav-metrics.ts` | Complete |
| `navigation.ts` | `../stripe/lib/navigation.ts` | `src/lib/navigation.ts` | Complete |
| `button.tsx` | `../stripe/components/ui/button.tsx` | `src/components/ui/button.tsx` | Complete |
| `avatar-image.tsx` | `../stripe/components/ui/avatar-image.tsx` | `src/components/ui/avatar-image.tsx` | Complete |
| `section-intro.tsx` | `../stripe/components/ui/section-intro.tsx` | `src/components/ui/section-intro.tsx` | Complete |
| `attribution.tsx` | `../stripe/components/ui/attribution.tsx` | `src/components/ui/attribution.tsx` | Complete |
| `icons.tsx` | `../stripe/components/icons.tsx` | `src/components/icons.tsx` | Complete |
| `brand/*` | `../stripe/components/brand/*` | `src/components/brand/*` | Complete |
| `header.tsx` | `../stripe/components/header/header.tsx` | `src/components/header/header.tsx` | Complete |
| `hero.tsx` | `../stripe/components/hero/hero.tsx` | `src/components/hero/hero.tsx` | Complete |
| `logo-strip.tsx` | `../stripe/components/hero/logo-strip.tsx` | `src/components/hero/logo-strip.tsx` | Complete |
| `pricing-chart.tsx` | `../stripe/components/features/pricing-chart.tsx` | `src/components/features/pricing-chart.tsx` | Complete |
| `features.tsx` | `../stripe/components/sections/features.tsx` | `src/components/sections/features.tsx` | Complete |
| `benefits.tsx` | `../stripe/components/sections/benefits.tsx` | `src/components/sections/benefits.tsx` | Complete |
| `pull-quote.tsx` | `../stripe/components/sections/pull-quote.tsx` | `src/components/sections/pull-quote.tsx` | Complete |
| `process.tsx` | `../stripe/components/sections/process.tsx` | `src/components/sections/process.tsx` | Complete |
| `testimonials.tsx` | `../stripe/components/sections/testimonials.tsx` | `src/components/sections/testimonials.tsx` | Complete |
| `cta.tsx` | `../stripe/components/sections/cta.tsx` | `src/components/sections/cta.tsx` | Complete |
| `footer.tsx` | `../stripe/components/sections/footer.tsx` | `src/components/sections/footer.tsx` | Complete |
| `public assets` | `../stripe/public/*` | `public/*` | Complete |

All files and components copied and available. Ready for StageTimer UI polish, feature additions, image generation, and section-by-section customization.
