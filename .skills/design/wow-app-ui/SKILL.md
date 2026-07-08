---
name: wow-app-ui
description: >
  Build senior-level (10+ years) app UIs with beautiful animated backgrounds and micro-interactions that look genuinely premium. Use this skill for dashboards, CRMs, SaaS apps, admin panels, onboarding flows, and any multi-view web application. Trigger whenever the user wants an app that looks "wow", "premium", "professional", "animated", or "like a real product" — even if they don't say the word "app". Covers 6 animated background techniques, a complete app shell, glassmorphism component library, micro-animation patterns, and loading/empty state design. Complements ghostdev-landing (which handles marketing pages) — this skill is for interactive app UIs.
---

# Senior App UI — Design System

The difference between a junior build and a senior build isn't the individual components — it's the coherence. Everything breathes at the same rhythm: spacing is systematic, colors are purposeful, motion is subtle and consistent. This skill gives you all of it.

---

## 1. Animated Backgrounds — 6 Techniques

Pick one (or layer at most two) per project. More is noise.

### Technique A: Aurora Drift (most versatile)

Soft overlapping orbs that drift slowly — looks alive without being distracting.

```css
body { background: var(--bg); }

.aurora {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.aurora-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.18;
  will-change: transform;
}
.aurora-orb-1 {
  width: 70vw; height: 60vh;
  top: -20vh; left: -15vw;
  background: oklch(54% 0.25 var(--h));
  animation: auroraA 18s ease-in-out infinite;
}
.aurora-orb-2 {
  width: 55vw; height: 50vh;
  bottom: -15vh; right: -10vw;
  background: oklch(50% 0.22 calc(var(--h) + 40));
  animation: auroraB 22s ease-in-out infinite;
}
.aurora-orb-3 {
  width: 40vw; height: 45vh;
  top: 30%; left: 40%;
  background: oklch(48% 0.20 calc(var(--h) - 30));
  animation: auroraC 26s ease-in-out infinite;
}
@keyframes auroraA {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(6vw,-4vh) scale(1.08); }
  66%      { transform: translate(-3vw,6vh) scale(0.95); }
}
@keyframes auroraB {
  0%,100% { transform: translate(0,0) scale(1); }
  40%      { transform: translate(-8vw,3vh) scale(1.06); }
  70%      { transform: translate(4vw,-5vh) scale(0.97); }
}
@keyframes auroraC {
  0%,100% { transform: translate(0,0) scale(1); }
  50%      { transform: translate(-5vw,-4vh) scale(1.1); }
}
```

### Technique B: Animated Mesh Gradient

Background color itself shifts — subtle but gives the whole app a living quality.

```css
body {
  background: linear-gradient(
    -45deg,
    oklch(7%  0.04 var(--h)),
    oklch(10% 0.06 calc(var(--h) + 20)),
    oklch(8%  0.05 calc(var(--h) - 20)),
    oklch(11% 0.07 var(--h))
  );
  background-size: 400% 400%;
  animation: meshShift 20s ease infinite;
}
@keyframes meshShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Technique C: Animated Grid / Scanlines

Sharp, technical aesthetic for developer tools, analytics, monitoring apps.

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(oklch(100% 0 0 / 0.025) 1px, transparent 1px),
    linear-gradient(90deg, oklch(100% 0 0 / 0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: gridPan 40s linear infinite;
  pointer-events: none;
  z-index: 0;
}
@keyframes gridPan {
  0%   { background-position: 0 0; }
  100% { background-position: 48px 48px; }
}
```

Layer with aurora orbs on top for a "command center" look.

### Technique D: Canvas Particle Field

Floating dots at different depths create parallax depth. Use for data-heavy or "live" apps.

```js
(function() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.35';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles = Array.from({length: 80}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      o: Math.random() * 0.5 + 0.1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'oklch(76% 0.15 264)';  /* use your accent color */
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      ctx.globalAlpha = p.o;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', init);
})();
```

### Technique E: SVG Morphing Blob

One large organic shape that slowly morphs — feels premium and organic, good for fintech/health.

```html
<svg class="blob-bg" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="blur-blob"><feGaussianBlur stdDeviation="40"/></filter>
  </defs>
  <path filter="url(#blur-blob)" fill="oklch(56% 0.22 var(--h) / 0.15)">
    <animate attributeName="d" dur="12s" repeatCount="indefinite"
      values="
        M400,150 C520,120 650,200 680,300 C710,400 640,500 520,540 C400,580 280,540 210,450 C140,360 150,240 230,180 C280,140 350,165 400,150Z;
        M400,130 C540,100 670,210 660,330 C650,440 560,520 430,545 C300,570 200,510 170,410 C140,310 180,210 260,165 C320,130 360,145 400,130Z;
        M400,150 C520,120 650,200 680,300 C710,400 640,500 520,540 C400,580 280,540 210,450 C140,360 150,240 230,180 C280,140 350,165 400,150Z
      "/>
  </path>
</svg>
```

```css
.blob-bg {
  position: fixed;
  top: -10%; left: -10%;
  width: 120%; height: 120%;
  pointer-events: none;
  z-index: 0;
}
```

### Technique F: Spotlight / Cursor Follow

Premium effect where a soft light follows the cursor — used by Linear, Vercel, Raycast.

```js
(function() {
  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position:fixed; pointer-events:none; z-index:0;
    width:600px; height:600px; border-radius:50%;
    background: radial-gradient(circle, oklch(64% 0.22 264 / 0.07) 0%, transparent 70%);
    transform: translate(-300px, -300px);
    transition: transform 0.15s ease-out;
    will-change: transform;
  `;
  document.body.prepend(spotlight);
  document.addEventListener('mousemove', e => {
    spotlight.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
  }, { passive: true });
})();
```

---

## 2. App Shell Architecture

The shell is the frame that holds everything. Get this right and the rest falls into place.

```
┌──────────────────────────────────────────────┐
│  Sidebar (240px) │  Top Bar (56px)            │
│  ─────────────── │  ────────────────────────  │
│  Logo            │  Breadcrumb    Search  👤  │
│  ─────────────── │  ──────────────────────────│
│  Nav items       │                            │
│  (with icons)    │   Content Area             │
│                  │   (overflow: auto)         │
│  ─────────────── │                            │
│  User / settings │                            │
└──────────────────────────────────────────────┘
```

```css
.app-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 56px 1fr;
  height: 100dvh;
  position: relative;
  z-index: 1;
}

.sidebar {
  grid-row: 1 / -1;
  background: oklch(9% 0.020 var(--h) / 0.85);
  border-right: 1px solid var(--border);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  gap: 4px;
  overflow-y: auto;
}

.topbar {
  background: oklch(10% 0.020 var(--h) / 0.8);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
}

.content {
  overflow-y: auto;
  padding: clamp(20px, 3vw, 32px);
  scrollbar-width: thin;
  scrollbar-color: var(--accent-dim) transparent;
}
```

### Sidebar nav item

```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  position: relative;
}
.nav-item:hover {
  background: oklch(100% 0 0 / 0.04);
  color: var(--text);
}
.nav-item.active {
  background: var(--accent-dim);
  color: var(--accent-text);
}
/* Animated active indicator */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
}
```

---

## 3. Component Library

### KPI / Stat Card (with animated number)

```html
<div class="kpi-card">
  <div class="kpi-label">Monthly Revenue</div>
  <div class="kpi-value" data-count="48200">$0</div>
  <div class="kpi-delta positive">↑ 12.4% vs last month</div>
</div>
```

```css
.kpi-card {
  background: oklch(12% 0.025 var(--h) / 0.7);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, border-color 0.25s ease;
}
.kpi-card::before { /* gradient top border */
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}
.kpi-card:hover {
  transform: translateY(-3px);
  border-color: oklch(64% 0.22 var(--h) / 0.2);
}
.kpi-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
.kpi-value {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 700;
  background: linear-gradient(135deg, var(--text) 10%, var(--accent-text) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 8px 0 6px;
}
.kpi-delta { font-size: 12px; font-weight: 500; }
.kpi-delta.positive { color: oklch(70% 0.18 145); }
.kpi-delta.negative { color: oklch(65% 0.20 25); }
```

### Button System

```css
/* Base */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  border: none; outline: none;
  transition: transform 0.1s ease, box-shadow 0.2s ease, background 0.2s ease;
  user-select: none;
}
.btn:active { transform: scale(0.97); }

/* Primary */
.btn-primary {
  background: var(--accent);
  color: oklch(98% 0.005 var(--h));
  box-shadow: 0 0 0 0 var(--accent-glow);
}
.btn-primary:hover {
  background: oklch(70% 0.22 var(--h));
  box-shadow: 0 4px 20px var(--accent-glow);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}
.btn-ghost:hover {
  background: oklch(100% 0 0 / 0.04);
  border-color: oklch(100% 0 0 / 0.12);
}

/* Destructive */
.btn-danger {
  background: oklch(50% 0.22 25);
  color: white;
}
.btn-danger:hover { background: oklch(55% 0.22 25); }
```

### Skeleton Loader (shimmer)

Never use a spinner for content that has known shape. Skeletons feel faster.

```css
.skeleton {
  background: linear-gradient(
    90deg,
    oklch(15% 0.015 var(--h)) 25%,
    oklch(18% 0.020 var(--h)) 50%,
    oklch(15% 0.015 var(--h)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
  border-radius: 6px;
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
/* Usage: <div class="skeleton" style="height:20px;width:60%;margin-bottom:8px"></div> */
```

### Toast Notification System

```css
.toast-stack {
  position: fixed;
  bottom: 24px; right: 24px;
  display: flex; flex-direction: column; gap: 8px;
  z-index: 9999;
  pointer-events: none;
}
.toast {
  display: flex; align-items: center; gap: 12px;
  background: oklch(16% 0.025 var(--h) / 0.95);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 280px; max-width: 380px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px oklch(0% 0 0 / 0.4);
  pointer-events: all;
  font-size: 14px;
  animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.toast.out { animation: toastOut 0.2s ease forwards; }
@keyframes toastIn  { from{opacity:0;transform:translateX(20px) scale(0.95)} to{opacity:1;transform:none} }
@keyframes toastOut { to{opacity:0;transform:translateX(20px) scale(0.95)} }
.toast-icon { font-size: 16px; flex-shrink: 0; }
.toast-success { border-left: 3px solid oklch(70% 0.18 145); }
.toast-error   { border-left: 3px solid oklch(65% 0.20 25); }
.toast-info    { border-left: 3px solid var(--accent); }
```

```js
function showToast(message, type = 'info', duration = 3500) {
  const stack = document.querySelector('.toast-stack') || (() => {
    const s = document.createElement('div');
    s.className = 'toast-stack';
    document.body.appendChild(s);
    return s;
  })();
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  stack.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), {once: true});
  }, duration);
}
```

### Modal with backdrop blur

```css
.modal-backdrop {
  position: fixed; inset: 0;
  background: oklch(0% 0 0 / 0.6);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  animation: backdropIn 0.2s ease;
}
.modal {
  background: oklch(13% 0.025 var(--h));
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px 32px;
  width: min(540px, 90vw);
  box-shadow: 0 32px 64px oklch(0% 0 0 / 0.5);
  animation: modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes backdropIn { from{opacity:0} to{opacity:1} }
@keyframes modalIn    { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:none} }
```

---

## 4. Micro-interactions — the Details That Matter

### Tab indicator (sliding underline)

```css
.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); }
.tab  {
  padding: 10px 16px; font-size: 14px; font-weight: 500;
  color: var(--muted); cursor: pointer; position: relative;
  transition: color 0.2s ease;
}
.tab:hover { color: var(--text); }
.tab.active { color: var(--accent-text); }
.tab.active::after {
  content: '';
  position: absolute; bottom: -1px; left: 0; right: 0;
  height: 2px; border-radius: 2px;
  background: var(--accent);
  animation: tabSlide 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes tabSlide { from{transform:scaleX(0)} to{transform:scaleX(1)} }
```

### Input with focus glow

```css
.input-wrap { position: relative; }
.input {
  width: 100%;
  background: oklch(11% 0.020 var(--h));
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px; color: var(--text);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}
.input::placeholder { color: var(--muted); }
```

### Toggle switch

```css
.toggle { position: relative; display: inline-flex; width: 44px; height: 24px; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-track {
  position: absolute; inset: 0; border-radius: 12px;
  background: oklch(20% 0.020 var(--h));
  border: 1px solid var(--border);
  transition: background 0.25s ease;
}
.toggle input:checked ~ .toggle-track { background: var(--accent); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: white;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 4px oklch(0% 0 0 / 0.3);
}
.toggle input:checked ~ .toggle-track .toggle-thumb { transform: translateX(20px); }
```

### Status badge

```css
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px 3px 7px; border-radius: 20px;
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
}
.badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; animation: badgePulse 2s ease-in-out infinite; }
.badge-active  { background: oklch(70% 0.18 145 / 0.12); color: oklch(70% 0.18 145); }
.badge-active::before { background: oklch(70% 0.18 145); }
.badge-pending { background: oklch(72% 0.18 85 / 0.12); color: oklch(72% 0.18 85); }
.badge-pending::before { background: oklch(72% 0.18 85); }
.badge-error   { background: oklch(65% 0.20 25 / 0.12); color: oklch(65% 0.20 25); }
.badge-error::before { background: oklch(65% 0.20 25); animation: none; }
@keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
```

---

## 5. Empty States (never just a blank area)

```html
<div class="empty-state">
  <div class="empty-icon">📭</div>
  <h3 class="empty-title">No results yet</h3>
  <p class="empty-body">When you add items, they'll appear here.</p>
  <button class="btn btn-primary">Get started</button>
</div>
```

```css
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center;
  padding: 64px 32px; gap: 12px;
}
.empty-icon {
  font-size: 48px; opacity: 0.5;
  filter: grayscale(0.3);
  animation: emptyFloat 4s ease-in-out infinite;
}
.empty-title { font-size: 18px; font-weight: 600; color: var(--text); }
.empty-body  { font-size: 14px; color: var(--muted); max-width: 280px; line-height: 1.6; }
@keyframes emptyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
```

---

## 6. Color Token System

Extend the ghostdev-landing token system for app contexts:

```css
:root {
  --h: 244;  /* indigo/blue works best for productivity apps */

  /* App-specific semantic tokens */
  --success: oklch(70% 0.18 145);
  --success-bg: oklch(70% 0.18 145 / 0.10);
  --warning: oklch(72% 0.18 85);
  --warning-bg: oklch(72% 0.18 85 / 0.10);
  --danger:  oklch(65% 0.20 25);
  --danger-bg: oklch(65% 0.20 25 / 0.10);

  /* Data visualization palette (same hue family) */
  --data-1: oklch(64% 0.22 var(--h));
  --data-2: oklch(64% 0.22 calc(var(--h) + 40));
  --data-3: oklch(64% 0.22 calc(var(--h) + 80));
  --data-4: oklch(64% 0.22 calc(var(--h) + 120));
  --data-5: oklch(64% 0.22 calc(var(--h) + 160));
}
```

---

## 7. Motion Principles

A 10-year senior doesn't animate everything — they animate the right things.

| Situation | Duration | Easing |
|-----------|----------|--------|
| Button press / instant feedback | 80–120ms | `ease-out` |
| Hover state change | 150–200ms | `ease` |
| Card appear / slide in | 250–350ms | `cubic-bezier(0.34,1.56,0.64,1)` (spring) |
| Modal open | 250ms | spring easing |
| Page transition | 300ms | `ease-in-out` |
| Ambient (aurora, float) | 12–25s | `ease-in-out infinite` |

Only animate `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` — these cause layout reflow and janky animations.

---

## 8. Quality Checklist

- [ ] Background animation uses `will-change: transform` on animated elements
- [ ] `prefers-reduced-motion` disables all ambient animations
- [ ] Sidebar has active indicator (left border + background tint)
- [ ] Buttons have `:active { transform: scale(0.97) }` press feedback
- [ ] Loading states use skeleton shimmer, not spinners
- [ ] Empty states have an illustrated/emoji icon + action CTA
- [ ] No `alert()` — use `showToast()`
- [ ] No `onclick=` inline — use event delegation
- [ ] All color tokens use `oklch` with `--h` variable
- [ ] `focus-visible` + `focus:not(focus-visible)` defined
- [ ] `z-index` scale: bg=0, content=1, sticky=10, dropdown=100, modal=1000, toast=9999

