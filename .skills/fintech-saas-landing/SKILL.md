---
name: fintech-saas-landing
description: >
  Build premium fintech/SaaS landing pages with a 3D perspective grid floor hero, floating 3D icon cards orbiting in space, deep dark teal/navy atmospheres, dashboard mockup reveals on scroll, and bento feature grids with embedded UI screenshots. Use this skill whenever the user wants a landing page for: investment trackers, crypto platforms, trading dashboards, fintech apps, data analytics tools, portfolio managers, or any SaaS that needs to feel cutting-edge and technical. Triggers on: "fintech landing", "crypto landing", "investment platform", "trading app landing", "SaaS with 3D hero", "3D grid floor", "floating icons hero", "dashboard reveal section", "bento features", "dark teal", "technical SaaS", "data platform", "analytics landing". Pairs with advanced-fx for extra particle effects. This style is inspired by top-tier fintech products — think Alturos, Linear, Vercel, or Stripe-level polish.
---

# Fintech SaaS Landing Page

This skill builds high-converting, visually stunning landing pages for fintech, crypto, analytics, and technical SaaS products. The signature element is the **3D perspective grid floor** combined with **floating 3D icon cards** in the hero — it instantly communicates technical sophistication.

Read `references/hero-3d.md` for the 3D grid + floating icons code, `references/sections.md` for features bento, dashboard reveal, and all other sections.

## Design System

```css
:root {
  /* Fintech dark teal palette */
  --bg: #040d14;           /* near-black with teal cast */
  --bg-surface: #071a26;
  --bg-raised: #0c2438;
  --teal: #14b8a6;         /* primary accent */
  --teal-dim: rgba(20,184,166,0.12);
  --teal-glow: 0 0 40px rgba(20,184,166,0.35);
  --blue: #3b82f6;         /* secondary accent */
  --text: #f0f9ff;
  --text-2: #7ecbd8;       /* teal-tinted secondary */
  --text-3: #3a6070;
  --border: rgba(20,184,166,0.12);
  --border-strong: rgba(20,184,166,0.25);
  --section: clamp(80px,10vw,140px);
  --container: 1200px;
  --radius: 16px;
  --h: 185;                /* hue anchor for oklch variants */
}
```

## Typography Pattern

```css
/* Load from Google Fonts */
/* Sora (bold sans) + Cormorant Garamond (editorial italic) */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Cormorant+Garamond:ital,wght@1,500;1,700&display=swap');

/* Hero headline */
.hl-sans  { font-family: 'Sora', sans-serif; font-weight: 800; }
.hl-serif { font-family: 'Cormorant Garamond', serif; font-style: italic; }

/* Typical headline: "Track & Grow Your" + italic serif word */
/* Result: "Track & Grow Your Investments with <em>Confidence</em>" */
```

## Page Structure

```
header           — transparent nav, pill CTA
hero             — 3D grid floor + floating icons + centered headline
logos-bar        — "Trusted by" with client logos
features-bento   — bento grid with embedded UI screenshots
how-it-works     — dashboard mockup reveal section
benefits         — 3-column icon + text list
pricing          — 3-tier card grid
cta-final        — full-width gradient CTA
footer
```

## Hero 3D Grid Floor

The signature element. A perspective-transformed grid that creates a vanishing-point floor effect:

```css
.hero-grid-floor {
  position: absolute;
  bottom: 0; left: 50%; transform: translateX(-50%);
  width: 160%; height: 60%;
  background-image:
    linear-gradient(rgba(20,184,166,0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(20,184,166,0.15) 1px, transparent 1px);
  background-size: 60px 60px;
  transform: translateX(-50%) perspective(600px) rotateX(65deg);
  transform-origin: bottom center;
  mask-image: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 70%);
  -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 70%);
  pointer-events: none;
}

/* Animated glow lines moving "toward" the viewer */
.hero-grid-floor::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 58px,
    rgba(20,184,166,0.08) 58px,
    rgba(20,184,166,0.08) 60px
  );
  animation: gridMove 3s linear infinite;
}
@keyframes gridMove {
  from { background-position: 0 0; }
  to   { background-position: 0 60px; }
}
```

## Floating 3D Icon Cards

Crypto/app icons that float and gently rotate in 3D space around the headline:

```css
.float-icons { position: absolute; inset: 0; pointer-events: none; }

.ficon {
  position: absolute;
  width: 72px; height: 72px;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(7,26,38,0.9);
  border: 1px solid var(--border-strong);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  transform-style: preserve-3d;
  will-change: transform;
}

.ficon img, .ficon svg { width: 40px; height: 40px; }

/* Position each icon */
.ficon-1 { top: 30%; left: 8%;  animation: floatA 6s ease-in-out infinite; }
.ficon-2 { top: 20%; right: 10%; animation: floatB 7s ease-in-out infinite 1s; }
.ficon-3 { bottom: 35%; left: 14%; animation: floatA 5s ease-in-out infinite 2s; }
.ficon-4 { bottom: 25%; right: 8%; animation: floatB 8s ease-in-out infinite 0.5s; }

@keyframes floatA {
  0%,100% { transform: translateY(0) rotate(-4deg) rotateY(8deg); }
  50%      { transform: translateY(-18px) rotate(4deg) rotateY(-8deg); }
}
@keyframes floatB {
  0%,100% { transform: translateY(-10px) rotate(3deg) rotateY(-6deg); }
  50%      { transform: translateY(10px) rotate(-3deg) rotateY(6deg); }
}
```

```html
<!-- Inside .hero -->
<div class="float-icons">
  <div class="ficon ficon-1">
    <!-- Ethereum SVG or img -->
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 2L4 16.5l12 7 12-7L16 2z" fill="rgba(20,184,166,0.8)"/>
      <path d="M16 28L4 16.5l12 7 12-7L16 28z" fill="rgba(20,184,166,0.4)"/>
    </svg>
  </div>
  <div class="ficon ficon-2"><!-- Bitcoin icon --></div>
  <div class="ficon ficon-3"><!-- Chart icon --></div>
  <div class="ficon ficon-4"><!-- Shield/security icon --></div>
</div>
```

## Dashboard Mockup Reveal

A large app screenshot that animates up into view as the user scrolls into the section:

```css
.mockup-reveal {
  position: relative;
  margin-top: 60px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 0 80px rgba(20,184,166,0.08), 0 40px 120px rgba(0,0,0,0.6);
  transform: translateY(60px);
  opacity: 0;
  transition: transform 1s cubic-bezier(0,0,0.2,1), opacity 0.8s ease;
}
.mockup-reveal.is-visible {
  transform: translateY(0);
  opacity: 1;
}

/* Gradient overlay to hint at more content below */
.mockup-reveal::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 120px;
  background: linear-gradient(to top, var(--bg-surface), transparent);
  pointer-events: none;
}

/* Top accent line */
.mockup-reveal::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--teal), transparent);
  z-index: 1;
}
```

Trigger with IntersectionObserver + `data-reveal` (see scroll-reveal skill).

## Bento Feature Grid

A bento-style grid where each feature cell contains an embedded UI mockup:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto;
  gap: 1px;
  background: var(--border);
  border-radius: 24px;
  overflow: hidden;
}

/* Feature cells — each spans different columns */
.bento-cell { background: var(--bg-surface); padding: 40px 32px; position: relative; overflow: hidden; }
.bento-cell-wide   { grid-column: span 7; } /* left, wide */
.bento-cell-narrow { grid-column: span 5; } /* right, narrow */
.bento-cell-half   { grid-column: span 6; } /* equal halves */
.bento-cell-third  { grid-column: span 4; } /* thirds */

/* Hover glow */
.bento-cell::before {
  content: '';
  position: absolute; inset: 0; opacity: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(20,184,166,0.1) 0%, transparent 70%);
  transition: opacity 0.4s;
  pointer-events: none;
}
.bento-cell:hover::before { opacity: 1; }

/* Top accent border on hover */
.bento-cell::after {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(20,184,166,0.5), transparent);
  opacity: 0; transition: opacity 0.4s;
}
.bento-cell:hover::after { opacity: 1; }

/* Embedded UI mockup inside bento cell */
.bento-mockup {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

@media(max-width: 768px) {
  .bento-cell-wide, .bento-cell-narrow, .bento-cell-half, .bento-cell-third {
    grid-column: span 12;
  }
}
```

## Atmospheric Hero Background

```css
.hero-bg {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
}

/* Central radial glow */
.hero-glow {
  position: absolute;
  top: -10%; left: 50%; transform: translateX(-50%);
  width: 900px; height: 600px;
  background: radial-gradient(ellipse, rgba(20,184,166,0.07) 0%, transparent 65%);
  border-radius: 50%;
}

/* Noise texture overlay */
body::after {
  content: '';
  position: fixed; inset: 0;
  opacity: 0.028;
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

## Logo Bar

```css
.logos-bar {
  padding: 40px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.logos-label {
  text-align: center;
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-3); margin-bottom: 24px;
}
.logos-track {
  display: flex; align-items: center; gap: 60px;
  animation: logoScroll 20s linear infinite;
  width: max-content;
}
@keyframes logoScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
/* Duplicate logos to create seamless loop */
.logos-track img { height: 24px; opacity: 0.45; filter: brightness(0) invert(1); transition: opacity 0.2s; }
.logos-track img:hover { opacity: 0.8; }
```

## CTA Button Styles

```css
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 100px; /* pill shape */
  background: var(--teal); color: #fff;
  font-weight: 700; font-size: 15px;
  border: none; cursor: pointer; text-decoration: none;
  transition: box-shadow 0.2s, transform 0.15s;
}
.btn-primary:hover {
  box-shadow: var(--teal-glow);
  transform: translateY(-2px);
}

.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 24px; border-radius: 100px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--text); font-weight: 600; font-size: 15px;
  cursor: pointer; text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}
.btn-ghost:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}
```

## Full Implementation Reference

See `references/full-page.md` for the complete HTML skeleton of all sections with actual content.
