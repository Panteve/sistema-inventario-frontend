# Canvas 2D & SVG Patterns

## Canvas 2D Scaffold

Every canvas animation uses this exact structure.

```js
(function() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    init(); // re-initialize on resize
  }

  function init() {
    // Create your objects/particles here
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    // Draw everything here
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();
```

## 1. Particle Network (connected dots)

The classic tech/data background. Particles float and connect when close.

```js
// Replace init() and draw() in scaffold:

let particles;

function init() {
  particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    r: Math.random() * 2 + 1,
  }));
}

const ACCENT = [99, 102, 241]; // RGB of your accent
const DIST = 140; // max connection distance

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < DIST) {
        const a = 1 - d / DIST;
        ctx.strokeStyle = `rgba(${ACCENT},${a * 0.4})`;
        ctx.lineWidth = a * 1.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw and move particles
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    ctx.fillStyle = `rgba(${ACCENT},0.7)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
```

## 2. Physics Simulation — Balls with Gravity

```js
let balls;
const GRAVITY = 0.4;

function init() {
  balls = Array.from({ length: 20 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.5,
    vx: (Math.random() - 0.5) * 6,
    vy: Math.random() * 3,
    r: Math.random() * 20 + 10,
    hue: Math.random() * 60 + 220, // blue-purple range
  }));
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  balls.forEach(b => {
    // Physics
    b.vy += GRAVITY;
    b.x += b.vx; b.y += b.vy;

    // Bounce off walls
    if (b.x - b.r < 0)  { b.x = b.r;   b.vx = Math.abs(b.vx) * 0.85; }
    if (b.x + b.r > W)  { b.x = W-b.r; b.vx = -Math.abs(b.vx) * 0.85; }
    if (b.y - b.r < 0)  { b.y = b.r;   b.vy = Math.abs(b.vy) * 0.85; }
    if (b.y + b.r > H)  { b.y = H-b.r; b.vy = -Math.abs(b.vy) * 0.85; b.vx *= 0.99; }

    // Draw with gradient
    const g = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, 0, b.x, b.y, b.r);
    g.addColorStop(0, `hsla(${b.hue+20},80%,75%,0.95)`);
    g.addColorStop(1, `hsla(${b.hue},70%,45%,0.8)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
```

## 3. Perlin-Style Noise Wave (flowing lines)

Smooth, organic flowing field using noise approximation.

```js
// Simplex-ish noise using sin
function noise(x, y, t) {
  return (
    Math.sin(x * 0.4 + t) * Math.cos(y * 0.3 + t * 0.7) * 0.5 +
    Math.sin(x * 0.15 - t * 0.5) * Math.cos(y * 0.2 + t * 0.3) * 0.3 +
    Math.sin((x + y) * 0.25 + t * 0.8) * 0.2
  );
}

let t = 0;
function draw() {
  ctx.clearRect(0, 0, W, H);

  const step = 6; // grid resolution
  for (let y = 0; y < H; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < W; x += step) {
      const n = noise(x / 80, y / 80, t);
      const py = y + n * 30;
      ctx.lineTo(x, py);
    }
    const alpha = 0.03 + Math.abs(noise(0, y / 80, t * 0.2)) * 0.04;
    ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  t += 0.005;
  requestAnimationFrame(draw);
}
```

## 4. SVG Animated Path (morph)

```html
<svg viewBox="0 0 400 400" style="width:100%;height:100%">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="oklch(64% 0.22 276)"/>
      <stop offset="100%" stop-color="oklch(54% 0.22 244)"/>
    </linearGradient>
  </defs>
  <path fill="url(#g1)" opacity="0.7">
    <animate attributeName="d" dur="6s" repeatCount="indefinite"
      values="
        M200,60 C300,40 360,130 340,200 C320,270 250,330 200,340 C150,330 80,270 60,200 C40,130 100,40 200,60Z;
        M200,50 C320,60 370,150 350,220 C330,290 260,340 200,340 C140,340 70,290 50,220 C30,150 80,60 200,50Z;
        M200,60 C300,40 360,130 340,200 C320,270 250,330 200,340 C150,330 80,270 60,200 C40,130 100,40 200,60Z
      "/>
  </path>
</svg>
```

## 5. Cursor Ripple Effect

Click anywhere to spawn a ripple ring.

```js
document.addEventListener('click', function(e) {
  const ring = document.createElement('div');
  ring.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    width:0; height:0; border-radius:50%;
    border:2px solid oklch(64% 0.22 264 / 0.6);
    left:${e.clientX}px; top:${e.clientY}px;
    transform:translate(-50%,-50%);
    animation: rippleOut 0.8s ease-out forwards;
  `;
  document.body.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove());
});

// Add to CSS:
// @keyframes rippleOut { to { width:120px; height:120px; opacity:0; } }
```
