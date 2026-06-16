---
name: scroll-reveal
description: >
  Add scroll-triggered entrance animations to any HTML page or SPA. Use this skill whenever the user wants sections, cards, or elements to animate in as they scroll — fade up, slide in, stagger, counter animations, parallax. Triggers on: "animate on scroll", "reveal on scroll", "entrance animations", "sections animate in", "stagger cards", "counter animation", "number counts up", "scroll animations", "scroll effects", "things appear as you scroll". Pairs with ghostdev-landing and wow-app-ui — this is the scroll motion layer.
---

# Scroll Reveal — Entrance Animations on Scroll

This skill adds production-grade scroll-triggered animations: IntersectionObserver reveal, stagger delays, animated counters, and parallax. All patterns are pure JS + CSS — no GSAP required (though GSAP is listed as an optional upgrade).

## How the System Works

Three pieces fit together:

1. **CSS classes** — define the hidden-then-visible states and stagger delays
2. **HTML attributes** — mark which elements reveal, and optionally how (`data-reveal="left"`)
3. **JS observer** — watches elements and adds `.visible` when they enter the viewport

When an element intersects, add `.visible` → CSS transition fires → element animates in. Once visible, stop observing it (fire-once pattern).

## Complete CSS

Always inject this into the `<style>` block (before `</style>`):

```css
/* ── SCROLL REVEAL ── */
[data-reveal]{opacity:0;will-change:transform,opacity}
[data-reveal="up"]{transform:translateY(36px)}
[data-reveal="down"]{transform:translateY(-24px)}
[data-reveal="left"]{transform:translateX(-40px)}
[data-reveal="right"]{transform:translateX(40px)}
[data-reveal="scale"]{transform:scale(0.88)}
[data-reveal="fade"]{transform:none}
[data-reveal].is-visible{opacity:1;transform:none;
  transition:opacity .65s cubic-bezier(0,0,0.2,1),
             transform .65s cubic-bezier(0,0,0.2,1)}

/* Stagger delays — add to children via JS or HTML */
.reveal-stagger > *:nth-child(1){transition-delay:.05s}
.reveal-stagger > *:nth-child(2){transition-delay:.12s}
.reveal-stagger > *:nth-child(3){transition-delay:.19s}
.reveal-stagger > *:nth-child(4){transition-delay:.26s}
.reveal-stagger > *:nth-child(5){transition-delay:.33s}
.reveal-stagger > *:nth-child(6){transition-delay:.40s}

/* Explicit delay helpers */
.reveal-d1{transition-delay:.1s !important}
.reveal-d2{transition-delay:.2s !important}
.reveal-d3{transition-delay:.3s !important}
.reveal-d4{transition-delay:.4s !important}
.reveal-d5{transition-delay:.5s !important}

/* Counter elements */
[data-count]{font-variant-numeric:tabular-nums}

@media(prefers-reduced-motion:reduce){
  [data-reveal],[data-reveal].is-visible{
    opacity:1;transform:none;transition:none}
  [data-count]{}
}
```

## Complete JS

Inject before `</body>` (or in your script block):

```js
/* Scroll Reveal System */
(function(){
  var rm = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  // ── REVEAL OBSERVER ──
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    },{threshold:0.08, rootMargin:'0px 0px -40px 0px'});

    document.querySelectorAll('[data-reveal]').forEach(function(el){
      if(rm){ el.classList.add('is-visible'); return; }
      io.observe(el);
    });
  } else {
    // Fallback: show everything
    document.querySelectorAll('[data-reveal]').forEach(function(el){
      el.classList.add('is-visible');
    });
  }

  // ── COUNTER ANIMATION ──
  // Targets elements with data-count="1234" (the target number)
  // Optionally data-count-prefix="$" and data-count-suffix="+"
  if(!rm && 'IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var el = e.target;
        var to   = parseInt(el.dataset.count, 10);
        var pre  = el.dataset.countPrefix  || '';
        var suf  = el.dataset.countSuffix  || '';
        var dur  = parseInt(el.dataset.countDur, 10) || 1400;
        cio.unobserve(el);
        if(rm){ el.textContent = pre + to + suf; return; }
        var start = 0, step = 16, steps = dur / step;
        var t = setInterval(function(){
          start += Math.ceil(to / steps);
          if(start >= to){ el.textContent = pre + to + suf; clearInterval(t); return; }
          el.textContent = pre + start + suf;
        }, step);
      });
    },{threshold:0.3});
    document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });
  } else {
    document.querySelectorAll('[data-count]').forEach(function(el){
      el.textContent = (el.dataset.countPrefix||'') + el.dataset.count + (el.dataset.countSuffix||'');
    });
  }

  // ── SUBTLE PARALLAX (optional, for hero backgrounds) ──
  // Add data-parallax="0.3" to any element for scroll parallax
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if(!rm && parallaxEls.length){
    window.addEventListener('scroll', function(){
      var sy = window.scrollY;
      parallaxEls.forEach(function(el){
        var factor = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = 'translateY(' + (sy * factor) + 'px)';
      });
    },{passive:true});
  }
})();
```

## HTML Usage Patterns

### Basic section reveal (most common):
```html
<!-- Whole section fades up -->
<section data-reveal="up">
  <h2>Title</h2>
  <p>Content</p>
</section>

<!-- Cards stagger in -->
<div class="cards-grid reveal-stagger">
  <div data-reveal="up">Card 1</div>
  <div data-reveal="up">Card 2</div>
  <div data-reveal="up">Card 3</div>
</div>
```

### Counter numbers:
```html
<span data-count="15" data-count-suffix="+">15+</span>
<span data-count="98" data-count-suffix="%" data-count-dur="1200">98%</span>
<span data-count="2400" data-count-prefix="$" data-count-suffix="k">$2400k</span>
```

### Combined (reveal + counter):
```html
<div data-reveal="up" class="stat">
  <div class="stat-num">
    <span data-count="127" data-count-suffix="%">127%</span>
  </div>
  <div class="stat-label">Faster delivery</div>
</div>
```

### Directional stagger for a features grid:
```html
<div class="features reveal-stagger">
  <div data-reveal="up">Feature A</div>
  <div data-reveal="up">Feature B</div>
  <div data-reveal="up">Feature C</div>
  <div data-reveal="up">Feature D</div>
</div>
```

### Parallax hero background:
```html
<div class="hero">
  <div class="hero-bg" data-parallax="0.25"></div>  <!-- BG moves slower -->
  <div class="hero-content">...</div>
</div>
```

## Implementation Checklist

When adding scroll-reveal to an existing page:
1. Inject CSS into the `<style>` block
2. Add JS before `</body>` (after existing scripts to avoid conflicts)
3. Walk each section in the HTML and add `data-reveal="up"` to:
   - Section containers or individual big headings
   - Card grids (add `reveal-stagger` to the grid, `data-reveal="up"` to each card)
   - Stats/metrics (add both `data-reveal` and `data-count` to number elements)
4. For `.reveal` class-based systems (legacy): replace or keep alongside `data-reveal` — both work with the same observer; just also observe `.reveal` elements and add `.is-visible` / `.visible`

## Upgrading to GSAP ScrollTrigger (optional)

Use GSAP when you need scrubbing, timeline control, or very complex orchestration:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script>
gsap.registerPlugin(ScrollTrigger);

// Stagger cards on scroll
gsap.fromTo('.card', 
  {opacity: 0, y: 40},
  {opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out',
   scrollTrigger: {trigger: '.cards-grid', start: 'top 80%'}}
);

// Parallax hero
gsap.to('.hero-bg', {
  yPercent: 30,
  ease: 'none',
  scrollTrigger: {trigger: '.hero', scrub: true}
});
</script>
```

GSAP is better when: you need scrub (scroll-locked animation), timeline sequencing across multiple elements, or reversing on scroll-up.

IntersectionObserver is better when: fire-once reveal, simpler implementation, no CDN dependency.
