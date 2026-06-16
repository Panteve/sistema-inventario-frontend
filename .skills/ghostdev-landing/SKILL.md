---
name: ghostdev-landing
description: >
  Build cinematic, production-grade HTML landing pages and SaaS marketing sites using the GhostDev design system — atmospheric backgrounds, Playfair Display italic hero type, oklch color tokens, glassmorphism cards, and micro-animations. Use this skill whenever the user wants a landing page, marketing site, product page, hero section, or any multi-section web page from scratch. Also use when they describe wanting "cinematic", "premium", "dark", "atmospheric", "animated", or "elegant" web design, even if they don't say "landing page". Covers both pure landing pages AND CSS upgrade overlays for existing CRM/app HTML.
---

# GhostDev Landing Page System

This skill encodes a complete cinematic design system derived from real production work. Follow it closely for any new landing page or visual upgrade to an existing HTML app.

## Design Identity

Every page built with this system has a recognizable signature:
- **Dark atmospheric canvas** with floating gradient orbs and a subtle dot grid
- **Playfair Display italic** for serif hero accents (emotional weight)
- **Inter 900** for bold structural labels and stats (visual punch)
- **oklch color system** with a single hue anchor `--h` that controls the entire palette
- **Glassmorphism cards** that float, glow on hover, and have a gradient top border
- **No raw hex colors** in the design layer — always tokens

The goal is a page that looks like it was art-directed, not generated.

---

## CSS Foundations

### 1. oklch Token System (required in every project)

```css
:root {
  --h: 276;  /* SINGLE HUE ANCHOR — change this one value to repaint the entire palette */
  --accent:      oklch(64% 0.22 var(--h));
  --accent-text: oklch(76% 0.15 var(--h));
  --accent-dim:  oklch(64% 0.22 var(--h) / 0.12);
  --accent-glow: oklch(64% 0.22 var(--h) / 0.35);

  --bg:      oklch(6% 0.015 var(--h));
  --surface: oklch(10% 0.020 var(--h));
  --raised:  oklch(14% 0.025 var(--h));
  --border:  oklch(100% 0 0 / 0.07);
  --text:    oklch(95% 0.005 var(--h));
  --muted:   oklch(60% 0.010 var(--h));

  --section: clamp(72px, 9vw, 120px);  /* consistent vertical rhythm */
}
```

**Hue presets by project type:**
- `276` — purple/violet (agency, dev tool, premium SaaS)
- `244` — indigo/blue (analytics, legal, productivity)
- `160` — teal/emerald (health, finance, growth)
- `30`  — amber/gold (luxury, food, retail)

### 2. Typography Scale

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=Inter:wght@300;400;600;700;900&display=swap');

/* Hero serif accent — the emotional hook */
.hl-serif {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: clamp(44px, 7.5vw, 96px);
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-text) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Bold structural label */
.hl-sans {
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: clamp(36px, 5.5vw, 72px);
  letter-spacing: -3px;
  color: var(--text);
}

/* Light subtitle */
.hl-light {
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  font-size: clamp(16px, 2vw, 22px);
  color: var(--muted);
  max-width: 520px;
}
```

### 3. Atmospheric Background (body)

```css
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
}

/* Gradient orbs — always use the --h anchor */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 20%, oklch(64% 0.22 var(--h) / 0.10) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 70%, oklch(64% 0.22 calc(var(--h) - 30) / 0.07) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* Dot grid overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, oklch(100% 0 0 / 0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}
```

### 4. feTurbulence Noise Overlay (required)

```html
<!-- Place immediately after <body> -->
<svg width="0" height="0" style="position:absolute">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
</svg>
<div style="position:fixed;inset:0;filter:url(#noise);opacity:0.025;pointer-events:none;z-index:1"></div>
```

### 5. Scrollbar

```css
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--accent-dim); border-radius: 3px; }
```

### 6. Accessibility Guards (always include both)

```css
/* Show focus ring only for keyboard navigation */
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }
:focus:not(:focus-visible) { outline: none; }

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## Hero Section

The hero always has two layers: the copy stack on the left, and a floating glass card on the right.

### Copy structure
```html
<h1>
  <span class="hl-serif">Cinematic phrase</span><br>
  <span class="hl-sans">Bold label.</span>
</h1>
<p class="hl-light">One-line value proposition that's concrete, not fluffy.</p>
<!-- Two CTAs: medium commitment (primary) + low commitment (ghost) -->
<div class="cta-group">
  <a href="#" class="btn-primary">Start free →</a>
  <a href="#" class="btn-ghost">Watch demo</a>
</div>
```

### Floating hero card
```css
.hero-card-wrap {
  animation: cardFloat 7s ease-in-out infinite;
  transform-origin: center;
}
@keyframes cardFloat {
  0%, 100% { transform: translateY(0) rotate(-1.2deg); }
  50%       { transform: translateY(-20px) rotate(0.6deg); }
}

.hero-card {
  background: oklch(12% 0.025 var(--h) / 0.85);
  border: 1px solid var(--border);
  border-radius: 20px;
  border-top: 1px solid oklch(64% 0.22 var(--h) / 0.35);
  backdrop-filter: blur(24px);
  box-shadow: 0 32px 64px oklch(0% 0 0 / 0.5), 0 0 0 1px var(--border);
}
```

### Mouse parallax (JS)
```js
const hero = document.querySelector('.hero');
const o1 = document.querySelector('.orb-1');
const o2 = document.querySelector('.orb-2');
if (hero && o1 && o2) {
  hero.addEventListener('mousemove', function(e) {
    const rx = (e.clientX / window.innerWidth - 0.5);
    const ry = (e.clientY / window.innerHeight - 0.5);
    o1.style.transform = `translate(${rx * 24}px, ${ry * 24}px)`;
    o2.style.transform = `translate(${rx * -14}px, ${ry * -14}px)`;
  }, { passive: true });
}
```

---

## CTA Escalation (3-level system)

Every page must have a clear intent ramp. Never put a high-commitment CTA first.

| Location | Intent level | Example |
|----------|-------------|---------|
| Nav | Low — explore | "See pricing" |
| Hero | Medium — consider | "Start free trial" |
| Final section | High — commit | "Get started now" |

### Final CTA with pulsing rings
```css
.cta-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.cta-ring { position: absolute; border-radius: 50%; border: 1px solid oklch(64% 0.22 var(--h) / 0.09); animation: ringScale 4.5s ease-in-out infinite; }
.cta-ring-1 { width: 200px; height: 200px; animation-delay: 0s; }
.cta-ring-2 { width: 300px; height: 300px; animation-delay: 1s; }
.cta-ring-3 { width: 420px; height: 420px; animation-delay: 2s; }
@keyframes ringScale {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50%       { transform: scale(1.06); opacity: 0.15; }
}
```

---

## Feature Cards & Glassmorphism

```css
.card {
  background: oklch(12% 0.025 var(--h) / 0.6);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: clamp(20px, 3vw, 32px);
  position: relative;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}
.card:hover {
  transform: translateY(-4px);
  border-color: oklch(64% 0.22 var(--h) / 0.25);
  box-shadow: 0 20px 40px oklch(0% 0 0 / 0.3);
}
```

---

## Process Section (numbered, serif)

Use large Playfair italic numbers to anchor each step — they feel human and editorial.

```css
.process-num {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 70px;
  color: oklch(64% 0.22 var(--h) / 0.15);  /* intentionally dim — background texture */
  line-height: 1;
  pointer-events: none;
  user-select: none;
}
```

---

## Stats Bar (animated counters)

```html
<span class="stat-num" data-count="3200">0</span>+
```

```js
document.querySelectorAll('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    let start = 0;
    const step = () => {
      start += Math.ceil(target / 60);
      el.textContent = Math.min(start, target).toLocaleString();
      if (start < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  obs.observe(el);
});
```

---

## Scroll Reveal

```js
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.12 });
reveals.forEach(el => obs.observe(el));
```

```css
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal.visible { opacity: 1; transform: none; }
```

---

## CRM / App CSS Overlay (gd-upgrade pattern)

When adding the ghostdev visual language to an existing functional HTML app (CRM, dashboard, etc.) **without rewriting the app**, inject a `<style id="gd-upgrade">` block before `</head>`. This layer overrides only visual tokens, leaving functionality intact.

```css
<style id="gd-upgrade">
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&display=swap');

[data-theme="dark"], :root {
  --h: 264;
  --gd-bg: #06060e;
  --gd-surface: #0c0c1a;
  --gd-raised: #131328;
  --gd-border: rgba(255,255,255,0.07);
  --gd-accent: oklch(62% 0.20 264);
  --gd-accent-text: oklch(76% 0.18 264);
  --gd-accent-dim: oklch(62% 0.20 264 / 0.12);
  --gd-glow: 0 0 32px oklch(62% 0.20 264 / 0.35);
}

body { background: var(--gd-bg) !important; }
body::before {
  content: '';
  position: fixed; inset: 0;
  background:
    radial-gradient(ellipse 50% 40% at 15% 15%, oklch(62% 0.20 264 / 0.08) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 85% 80%, oklch(62% 0.20 234 / 0.05) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
}
body::after {
  content: '';
  position: fixed; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  pointer-events: none; z-index: 0;
}

/* KPI / stat values — Playfair italic gradient */
.kpi-value, .stat-value {
  font-family: 'Playfair Display', serif !important;
  font-style: italic !important;
  background: linear-gradient(135deg, #EEEEF8 0%, oklch(76% 0.18 264) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent !important;
  background-clip: text;
}

/* Panel cards */
.glass-panel::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, oklch(62% 0.20 264 / 0.4), transparent);
}
.glass-panel:hover {
  border-color: oklch(62% 0.20 264 / 0.22) !important;
  transform: translateY(-2px) !important;
}

.brand { font-family: 'Playfair Display', serif !important; font-style: italic !important; }
.btn-primary { background: oklch(62% 0.20 264) !important; }
.nav-item.active { background: oklch(62% 0.20 264 / 0.12) !important; color: oklch(76% 0.18 264) !important; }
</style>
```

**Important**: Remove any previously injected upgrade blocks before adding a new one to avoid CSS conflicts.

---

## Quality Checklist

Before calling a page done, verify every item:

- [ ] `--h: NNN;` defined in `:root` — no hardcoded oklch hue values
- [ ] `feTurbulence` noise overlay present
- [ ] `--section: clamp(72px,9vw,120px)` used for all vertical padding
- [ ] Custom scrollbar (5px, accent color)
- [ ] `prefers-reduced-motion` guard present
- [ ] `focus-visible` + `focus:not(focus-visible)` both defined
- [ ] CTA escalation: nav=low, hero=medium, final=high
- [ ] No `onclick=` inline handlers — use `data-action` + event delegation
- [ ] No `alert()` calls — use inline notification UI instead
- [ ] Single accent — no `--accent-2` or second hue

---

## Common Mistakes to Avoid

**Dual accent temptation**: When adding a "secondary" color, use lightness/chroma variants of `--h` rather than a new hue. `oklch(80% 0.12 var(--h))` reads as the same color family, lighter.

**Hardcoded oklch**: Always `oklch(L% C var(--h))` not `oklch(64% 0.22 276)`. The whole point of `--h` is theme-switching with one variable.

**Inline handlers in new code**: Even if the file already has `onclick=` in original app code (acceptable in legacy CRM code), all new interactive elements must use `data-action` attributes and a delegated event listener at the document level.

**alert() in new code**: Use a `showToast(msg)` helper with a CSS-animated notification instead.

**Missing noise**: The feTurbulence layer is what separates "digital gradient" from "atmospheric texture." Never omit it.
