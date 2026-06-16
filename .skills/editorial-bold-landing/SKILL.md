---
name: editorial-bold-landing
description: >
  Build editorial, typographically-dominant landing pages for agencies, studios, creative firms, and bold brands. The signature is: massive display type (100–200px+) that clips or overflows the viewport, pure black/white high-contrast palette, bold uppercase section headers, horizontal process cards, and zero decorative gradients — just type, space, and weight. Use this skill whenever the user asks for: "agency website", "studio landing", "bold typography", "editorial design", "huge display type", "typographic landing", "black and white site", "creative agency", "design studio", "web studio", "freelance studio", "bold text hero", "brutalist web", "Swiss design", "editorial bold", "magazine-style site". This is the anti-gradient design — power through typography alone.
---

# Editorial Bold Landing Page

The anti-gradient style. No glows, no particles, no orbs. Just massive type, sharp contrast, and deliberate negative space. Used by top creative agencies, design studios, and bold brands.

Read `references/typography.md` for type patterns and `references/sections.md` for all section implementations.

## Core Philosophy

**One principle drives everything:** Typography IS the design. Every element serves the text — spacing, contrast, rhythm. No decorative noise.

- Background: `#0a0a0a` (near-black, not pure black to avoid screen bleed)
- Text: `#f2f2f2` (near-white, same reason)
- Accent: one color only, used sparingly (pill badges, underlines, highlight words)
- No gradients, no blurs, no shadows (except very subtle on interactive elements)
- Motion: text reveals, line draws, horizontal scrollers — no floaty orbs

## Design System

```css
:root {
  --bg: #0a0a0a;
  --surface: #111;
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.18);
  --text: #f2f2f2;
  --text-2: #888;
  --text-3: #444;
  --accent: #7c3aed;      /* adapt to brand: purple, orange, green, etc. */
  --accent-text: #a78bfa;
  --section: clamp(80px,10vw,140px);
  --container: 1280px;
  --radius: 4px;           /* almost no rounding — editorial feel */
}
```

## Typography System

```css
/* Load: Space Grotesk (bold display) + Fraunces (editorial italic) */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:ital,wght@1,700;1,900&display=swap');

/* DISPLAY — fills most of the hero width */
.display {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(60px, 12vw, 180px);
  line-height: 0.88;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--text);
}

/* DISPLAY overflow — clips at viewport edge, giving "architectural" feel */
.display-overflow {
  font-size: clamp(80px, 18vw, 260px);
  line-height: 0.82;
  letter-spacing: -0.06em;
  overflow: hidden;
  white-space: nowrap;
  /* Rotated stripe background creates a strong visual rhythm */
}

/* ITALIC serif accent word within display */
.display em {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 900;
  font-size: 1.1em;
  color: var(--text);
  letter-spacing: -0.04em;
}

/* SECTION HEADER — bold uppercase, left-aligned */
.section-heading {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(36px, 5vw, 72px);
  text-transform: uppercase;
  letter-spacing: -0.03em;
  line-height: 0.95;
}

/* BODY — clean, readable */
body { font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.6; }
```

## Hero Section — Display Overflow

```html
<section class="hero">
  <!-- Announcement pill -->
  <div class="hero-pill">
    <span class="pill-dot"></span>
    All templates · $349 →
  </div>

  <!-- Giant text that overflows viewport -->
  <div class="display-wrap">
    <p class="display">HACEMOS QUE</p>
    <p class="display">TU WEB</p>
    <p class="display accent-line">GENERE <em>OPORTUNIDADES</em></p>
  </div>

  <div class="hero-bottom">
    <p class="hero-desc">
      Creamos soluciones y experiencias digitales que elevan la imagen
      de tu negocio a la vez que generan resultados reales.
    </p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Trabajemos Juntos</a>
      <a href="#" class="btn-ghost">Ver Portfolio</a>
    </div>
  </div>
</section>
```

```css
.hero {
  min-height: 100vh;
  padding: clamp(120px, 16vh, 200px) 0 80px;
  overflow: hidden;
  position: relative;
}

.hero-pill {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--accent-text);
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.3);
  padding: 6px 16px; border-radius: 100px;
  margin-bottom: 48px;
}
.pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

.display-wrap { overflow: hidden; }

/* The accent line — one word gets the accent color */
.accent-line .hl-accent { color: var(--accent-text); }

/* Horizontal marquee strip between sections */
.marquee-strip {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 14px 0;
  overflow: hidden;
  margin: 60px 0;
}
.marquee-track {
  display: flex; gap: 0; width: max-content;
  animation: marquee 18s linear infinite;
}
.marquee-item {
  font-size: clamp(32px, 5vw, 60px);
  font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em;
  padding: 0 40px; white-space: nowrap; color: var(--text-3);
}
.marquee-item .dot { color: var(--accent); margin-right: 40px; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.hero-bottom {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 40px; flex-wrap: wrap;
  margin-top: 60px; padding-top: 40px;
  border-top: 1px solid var(--border);
}
.hero-desc { max-width: 420px; font-size: 15px; color: var(--text-2); line-height: 1.75; }
```

## Process / Services Section

Horizontal cards with large numbering and bold category names:

```css
.process-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--border);
}
.process-card {
  padding: 48px 36px;
  border-right: 1px solid var(--border);
  position: relative; overflow: hidden;
  transition: background 0.25s;
}
.process-card:last-child { border-right: none; }
.process-card:hover { background: var(--surface); }

.process-num {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-3); margin-bottom: 36px;
}
.process-time {
  font-size: 11px; color: var(--text-3); margin-bottom: 6px;
  float: right; clear: right;
}

.process-icon {
  width: 48px; height: 48px;
  border: 1px solid var(--border-strong); border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
  color: var(--text-2);
}
.process-icon svg { width: 24px; height: 24px; fill: currentColor; }

.process-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(28px, 3.5vw, 44px); font-weight: 700; text-transform: uppercase;
  letter-spacing: -0.03em; line-height: 0.95;
  margin-bottom: 16px;
}
.process-desc { font-size: 13px; color: var(--text-2); line-height: 1.7; }

/* Top border line — accent color on hover */
.process-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--accent);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
}
.process-card:hover::before { transform: scaleX(1); }

@media(max-width: 768px) { .process-grid { grid-template-columns: 1fr; } }
```

## Pricing Section

Raw, no-fluff pricing cards:

```css
.pricing-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px;
  background: var(--border); border: 1px solid var(--border);
}
.pricing-card {
  background: var(--bg); padding: 48px 40px;
  position: relative;
}
.pricing-card.featured { background: var(--surface); }

.pricing-service {
  font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-3); margin-bottom: 12px;
}
.pricing-name {
  font-size: clamp(24px, 3vw, 36px); font-weight: 700; text-transform: uppercase;
  letter-spacing: -0.02em; margin-bottom: 24px;
}
.pricing-price {
  font-family: 'Fraunces', serif; font-style: italic; font-weight: 900;
  font-size: clamp(48px, 7vw, 80px); letter-spacing: -0.04em; line-height: 1;
  color: var(--text);
}
.pricing-price sub { font-size: 0.3em; font-style: normal; vertical-align: super; }
.pricing-divider { border: none; border-top: 1px solid var(--border); margin: 28px 0; }
.pricing-features { list-style: none; }
.pricing-features li {
  font-size: 13px; color: var(--text-2); padding: 8px 0;
  border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px;
}
.pricing-features li::before { content: '—'; color: var(--accent); font-weight: 700; }
```

## Button System

```css
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px;
  background: var(--text); color: var(--bg);
  font-weight: 700; font-size: 14px; letter-spacing: 0.02em; text-transform: uppercase;
  border: none; cursor: pointer; text-decoration: none;
  border-radius: var(--radius);
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.85; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px;
  border: 1px solid var(--border-strong);
  color: var(--text-2); background: transparent;
  font-weight: 600; font-size: 14px; letter-spacing: 0.02em; text-transform: uppercase;
  cursor: pointer; text-decoration: none;
  border-radius: var(--radius);
  transition: color 0.15s, border-color 0.15s;
}
.btn-ghost:hover { color: var(--text); border-color: var(--border-strong); }
```

## Text Reveal Animation

On scroll, text lines reveal upward (mask clip-path animation):

```css
.reveal-line { overflow: hidden; }
.reveal-line > * {
  transform: translateY(110%);
  transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  display: block;
}
.reveal-line.is-visible > * { transform: translateY(0); }

/* Stagger multiple lines */
.reveal-line:nth-child(2) > * { transition-delay: 0.1s; }
.reveal-line:nth-child(3) > * { transition-delay: 0.2s; }
.reveal-line:nth-child(4) > * { transition-delay: 0.3s; }

@media(prefers-reduced-motion:reduce){
  .reveal-line > *{ transform: none; transition: none; }
}
```

```js
// Initialize text reveals with IntersectionObserver
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal-line').forEach(el => io.observe(el));
```

## Accent Color Variants

The single accent color completely changes the feel. Adapt to client brand:

```
Purple   #7c3aed — creative studio, design agency
Orange   #ea580c — energetic, bold, disruptive brand  
Teal     #0d9488 — tech, environmental, forward-looking
Yellow   #d97706 — luxury, editorial, fashion
Green    #16a34a — growth, health, sustainability
Red      #dc2626 — bold, urgent, sports brand
```
