---
name: product-pdp-adaptive
description: >
  Build color-adaptive product detail pages (PDPs) where the entire UI palette, background, and visual atmosphere dynamically shift to match the selected product variant color — like Nike, Apple, or high-end streetwear e-commerce. The page background, hero lighting, text treatments, and accent colors all change fluidly when the user picks a color swatch. Use this skill whenever the user asks for: "product page", "PDP", "e-commerce product detail", "shop page", "color-variant product", "Nike-style product page", "sneaker product page", "apparel PDP", "product showcase", "buy page", "product landing", "add to cart page", "product detail with color swatches", "color-adaptive UI", "theme-shifting product page", "dynamic color product", "street wear shop", "clothing brand site". This is the standard for premium direct-to-consumer brands.
---

# Color-Adaptive Product Detail Page (PDP)

A premium PDP where picking a color variant dynamically repaints the entire UI — the full-bleed background transitions to match the product color, creating a fully immersive per-variant atmosphere. Used by Nike, Apple, Adidas, Allbirds, and top DTC brands.

Read `references/full-page.md` for the complete HTML skeleton.

## Core Design Principle

**The product color IS the page color.** When a user picks "Midnight Blue", the background becomes deep navy. "Coral Red" → warm reddish atmosphere. "Forest Green" → deep emerald. Every accent, glow, highlight, and atmospheric color is derived from the selected variant color via CSS custom properties updated in JS.

## Design System

```css
:root {
  /* Base palette — overridden per variant */
  --variant-hue: 260;          /* hue of the active variant */
  --variant-sat: 70%;
  --variant-l: 15%;
  --bg: oklch(var(--variant-l) 0.08 var(--variant-hue));
  --bg-surface: oklch(calc(var(--variant-l) + 5%) 0.06 var(--variant-hue));
  --accent: oklch(65% 0.22 var(--variant-hue));
  --accent-glow: oklch(65% 0.22 var(--variant-hue) / 0.3);
  --text: #f8f8f8;
  --text-2: oklch(75% 0.05 var(--variant-hue));
  --border: oklch(50% 0.05 var(--variant-hue) / 0.2);
  --radius: 16px;
  --container: 1240px;
  --transition-color: background 0.6s cubic-bezier(0.4,0,0.2,1), color 0.4s ease;
}

/* Full background transition on variant change */
body {
  background: var(--bg);
  transition: background 0.6s cubic-bezier(0.4,0,0.2,1);
}
```

## Product Variant Data Structure

```js
const variants = [
  {
    id: 'midnight',
    name: 'Midnight',
    price: 189,
    hue: 235,        // CSS hue for oklch
    l: '8%',         // lightness of background
    colorSwatch: '#0f172a',
    colorDisplay: '#1e3a5f',  // the color shown in hero image background
    sizes: ['XS','S','M','L','XL','XXL'],
    stock: { XS: 3, S: 12, M: 8, L: 15, XL: 6, XXL: 2 },
    images: ['midnight-front.jpg', 'midnight-back.jpg', 'midnight-detail.jpg'],
    description: 'Deep navy with subtle midnight undertones. Woven from 95% organic cotton.'
  },
  {
    id: 'ember',
    name: 'Ember',
    price: 189,
    hue: 20,
    l: '10%',
    colorSwatch: '#7c2d12',
    colorDisplay: '#9a3412',
    sizes: ['XS','S','M','L','XL','XXL'],
    stock: { XS: 5, S: 9, M: 14, L: 7, XL: 3, XXL: 1 },
    images: ['ember-front.jpg', 'ember-back.jpg', 'ember-detail.jpg'],
    description: 'Warm ember tones that glow in natural light. Limited run colorway.'
  },
  {
    id: 'sage',
    name: 'Sage',
    price: 189,
    hue: 150,
    l: '9%',
    colorSwatch: '#14532d',
    colorDisplay: '#166534',
    sizes: ['S','M','L','XL'],
    stock: { S: 20, M: 18, L: 14, XL: 8 },
    images: ['sage-front.jpg', 'sage-back.jpg', 'sage-detail.jpg'],
    description: 'Earthy sage inspired by old-growth forests. Stonewash finish.'
  }
];

let activeVariant = variants[0];
let activeSize = null;
```

## Color Transition Engine

The JS function that repaints the entire UI when a variant is selected:

```js
function selectVariant(variantId) {
  const variant = variants.find(v => v.id === variantId);
  if(!variant) return;
  activeVariant = variant;
  activeSize = null;

  // Update CSS custom properties on :root — drives all color changes
  const root = document.documentElement;
  root.style.setProperty('--variant-hue', variant.hue);
  root.style.setProperty('--variant-l', variant.l);
  
  // Update explicit accent and bg for browsers that need it spelled out
  root.style.setProperty('--bg', `oklch(${variant.l} 0.08 ${variant.hue})`);
  root.style.setProperty('--bg-surface', `oklch(calc(${parseFloat(variant.l)}% + 5%) 0.06 ${variant.hue})`);
  root.style.setProperty('--accent', `oklch(65% 0.22 ${variant.hue})`);
  root.style.setProperty('--accent-glow', `oklch(65% 0.22 ${variant.hue} / 0.3)`);
  root.style.setProperty('--text-2', `oklch(75% 0.05 ${variant.hue})`);
  root.style.setProperty('--border', `oklch(50% 0.05 ${variant.hue} / 0.2)`);

  // Update hero background
  const heroBg = document.getElementById('hero-bg');
  if(heroBg) heroBg.style.background = `radial-gradient(ellipse 80% 70% at 50% 40%, ${variant.colorDisplay}44 0%, transparent 70%)`;
  
  // Update swatch active state
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.variant === variantId);
  });
  
  // Update product name, description, size grid
  renderProductInfo();
  renderSizeGrid();
  renderGallery();
  updateAddToCart();
}
```

## Layout

```html
<body>
  <nav class="nav"><!-- minimal nav: logo + cart icon + bag count --></nav>

  <main class="pdp-layout">
    <!-- LEFT: Product images -->
    <section class="gallery-panel">
      <div class="gallery-main">
        <div id="gallery-hero" class="gallery-hero">
          <!-- Main product image -->
        </div>
        <div id="gallery-thumbs" class="gallery-thumbs">
          <!-- Thumbnail strip -->
        </div>
      </div>
    </section>

    <!-- RIGHT: Product info + options -->
    <aside class="product-panel">
      <div class="product-breadcrumb"><!-- Shoes / Running --></div>
      <h1 id="product-name" class="product-name"><!-- --></h1>
      <div class="product-meta">
        <div class="product-price" id="product-price"><!-- --></div>
        <div class="product-rating"><!-- stars --></div>
      </div>

      <!-- Color swatches -->
      <div class="option-group">
        <div class="option-label">Color: <span id="active-color-name"></span></div>
        <div class="swatches" id="swatches"><!-- rendered by JS --></div>
      </div>

      <!-- Size grid -->
      <div class="option-group">
        <div class="option-label-row">
          <span class="option-label">Size</span>
          <a class="size-guide-link" href="#">Size Guide</a>
        </div>
        <div class="size-grid" id="size-grid"><!-- rendered by JS --></div>
      </div>

      <!-- Add to cart -->
      <button class="btn-atc" id="btn-atc" onclick="addToCart()">
        <svg><!-- bag icon --></svg>
        Add to Bag
      </button>

      <!-- Description + details accordion -->
      <div id="product-desc" class="product-desc"></div>
      <div class="accordion" id="accordion-details"><!-- materials, care, shipping --></div>
    </aside>
  </main>

  <!-- Floating add-to-cart confirmation toast -->
  <div class="cart-toast" id="cart-toast">Added to bag ✓</div>

  <!-- Hero atmospheric background (color-adaptive) -->
  <div class="hero-bg" id="hero-bg"></div>
</body>
```

## CSS Layout

```css
/* Nav */
.nav {
  position: fixed; top: 0; left: 0; right: 0; height: 64px; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px;
  background: transparent;
  backdrop-filter: blur(0px);
  transition: backdrop-filter 0.3s, background 0.3s;
}
.nav.scrolled {
  background: var(--bg-surface);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

/* Hero atmospheric background */
.hero-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: -1;
  transition: background 0.7s cubic-bezier(0.4,0,0.2,1);
}

/* PDP two-column layout */
.pdp-layout {
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 0;
  min-height: 100vh;
  padding-top: 64px;
  max-width: var(--container);
  margin: 0 auto;
}

/* Gallery */
.gallery-panel { position: sticky; top: 64px; height: calc(100vh - 64px); padding: 40px; }
.gallery-hero {
  width: 100%; aspect-ratio: 1;
  border-radius: 24px;
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  transition: background 0.6s ease, border-color 0.6s ease;
}
.gallery-hero img { width: 100%; height: 100%; object-fit: cover; }
.gallery-thumbs { display: flex; gap: 8px; margin-top: 12px; }
.gallery-thumb {
  width: 72px; height: 72px; border-radius: 10px;
  overflow: hidden; cursor: pointer;
  border: 2px solid transparent; transition: border-color 0.2s;
}
.gallery-thumb.active { border-color: var(--accent); }

/* Product panel */
.product-panel {
  padding: 48px 40px;
  border-left: 1px solid var(--border);
  overflow-y: auto; height: calc(100vh - 64px);
  position: sticky; top: 64px;
  transition: border-color 0.6s ease;
}
.product-name {
  font-size: clamp(28px, 3vw, 40px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.1;
  color: var(--text); margin: 8px 0 16px;
}
.product-price { font-size: 22px; font-weight: 700; color: var(--accent); }
.option-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-2); margin-bottom: 10px; }

/* Color swatches */
.swatches { display: flex; gap: 10px; flex-wrap: wrap; }
.swatch {
  width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; position: relative;
  transition: transform 0.15s; outline: 3px solid transparent; outline-offset: 3px;
}
.swatch:hover { transform: scale(1.15); }
.swatch.active { outline-color: var(--text); }

/* Size grid */
.size-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.size-btn {
  padding: 12px 8px; border-radius: 10px;
  border: 1px solid var(--border); background: transparent;
  color: var(--text); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  transition: background 0.4s ease, border-color 0.4s ease;
}
.size-btn:hover:not(.out-of-stock) { background: var(--bg-surface); border-color: var(--text-2); }
.size-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.size-btn.out-of-stock { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }

/* Add to cart */
.btn-atc {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 18px;
  background: var(--text); color: var(--bg);
  font-size: 16px; font-weight: 700; border: none; border-radius: 14px;
  cursor: pointer; margin-top: 24px;
  transition: opacity 0.15s, background 0.6s ease;
}
.btn-atc:hover { opacity: 0.88; }
.btn-atc:disabled { opacity: 0.4; cursor: not-allowed; }

/* Cart toast */
.cart-toast {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(80px);
  background: var(--text); color: var(--bg);
  padding: 14px 28px; border-radius: 100px; font-weight: 700; font-size: 14px;
  z-index: 500; transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  pointer-events: none;
}
.cart-toast.show { transform: translateX(-50%) translateY(0); }

@media(max-width: 900px) {
  .pdp-layout { grid-template-columns: 1fr; }
  .gallery-panel, .product-panel { position: static; height: auto; }
  .product-panel { border-left: none; border-top: 1px solid var(--border); }
}
```

## Key JS Functions

```js
// Swatch rendering
function renderSwatches() {
  document.getElementById('swatches').innerHTML = variants.map(v => `
    <button class="swatch ${v.id === activeVariant.id ? 'active' : ''}"
            style="background:${v.colorSwatch}"
            data-variant="${v.id}"
            title="${v.name}"
            onclick="selectVariant('${v.id}')">
    </button>
  `).join('');
  document.getElementById('active-color-name').textContent = activeVariant.name;
}

// Size grid rendering
function renderSizeGrid() {
  const grid = document.getElementById('size-grid');
  if(!grid) return;
  grid.innerHTML = activeVariant.sizes.map(s => {
    const inStock = activeVariant.stock[s] > 0;
    return `<button class="size-btn ${s === activeSize ? 'active' : ''} ${!inStock ? 'out-of-stock' : ''}"
                    onclick="${inStock ? `selectSize('${s}')` : ''}">
              ${s}
            </button>`;
  }).join('');
}

function selectSize(size) {
  activeSize = size;
  renderSizeGrid();
  updateAddToCart();
}

function updateAddToCart() {
  const btn = document.getElementById('btn-atc');
  if(!btn) return;
  btn.disabled = !activeSize;
  btn.textContent = activeSize ? `Add to Bag — $${activeVariant.price}` : 'Select a Size';
}

function addToCart() {
  const toast = document.getElementById('cart-toast');
  toast.textContent = `${activeVariant.name} / ${activeSize} — Added to Bag ✓`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Gallery render
function renderGallery() {
  // In a real implementation, swap src to variant-specific images
  // For demo, use a colored placeholder matching the variant
  const hero = document.getElementById('gallery-hero');
  if(hero) hero.style.background = `linear-gradient(135deg, ${activeVariant.colorDisplay}88, ${activeVariant.colorDisplay}22)`;
}

// Nav scroll state
window.addEventListener('scroll', () => {
  document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 10);
}, {passive: true});

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderSwatches();
  renderProductInfo();
  renderSizeGrid();
  renderGallery();
  updateAddToCart();
});
```

## Visual Atmosphere Details

Make the color shift feel immersive by adding:

```css
/* Radial glow at top matching variant color */
.page-glow {
  position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
  width: 800px; height: 600px; border-radius: 50%; pointer-events: none; z-index: -1;
  background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%);
  transition: background 0.6s ease;
}

/* Noise grain overlay for depth */
body::after {
  content: ''; position: fixed; inset: 0;
  opacity: 0.03; mix-blend-mode: overlay; pointer-events: none; z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

## Variant Color Presets (Ready to Use)

```js
// Copy-paste these variant definitions for common product types
const sneakerVariants = [
  { id: 'obsidian', name: 'Obsidian',    hue: 240, l: '7%',  colorSwatch: '#1e1b4b', colorDisplay: '#312e81' },
  { id: 'chalk',    name: 'Chalk White', hue: 220, l: '20%', colorSwatch: '#e2e8f0', colorDisplay: '#cbd5e1' },
  { id: 'volt',     name: 'Volt',        hue: 80,  l: '8%',  colorSwatch: '#365314', colorDisplay: '#4d7c0f' },
  { id: 'magma',    name: 'Magma',       hue: 15,  l: '9%',  colorSwatch: '#7f1d1d', colorDisplay: '#991b1b' },
  { id: 'arctic',   name: 'Arctic Blue', hue: 200, l: '8%',  colorSwatch: '#0c4a6e', colorDisplay: '#0369a1' },
];
```
