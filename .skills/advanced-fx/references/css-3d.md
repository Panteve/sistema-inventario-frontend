# CSS 3D Patterns

## 1. Mouse-Tracking 3D Tilt Card

The effect used by Stripe, Vercel, Linear for hero cards. The card tilts towards the cursor.

```html
<div class="tilt-scene">
  <div class="tilt-card" id="tiltCard">
    <div class="tilt-content">
      <!-- card content here -->
      <div class="tilt-shine"></div>
    </div>
  </div>
</div>
```

```css
.tilt-scene {
  perspective: 800px;
  perspective-origin: 50% 50%;
}
.tilt-card {
  transform-style: preserve-3d;
  transition: transform 0.1s ease;
  will-change: transform;
  border-radius: 20px;
  cursor: pointer;
}
/* Elements with data-depth get a z-translate for parallax depth */
[data-depth] {
  transform: translateZ(calc(var(--d, 0) * 1px));
  transition: transform 0.1s ease;
}
.tilt-shine {
  position: absolute; inset: 0; border-radius: inherit;
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%),
    oklch(100% 0 0 / 0.08) 0%, transparent 60%);
  pointer-events: none;
}
```

```js
(function() {
  const card = document.getElementById('tiltCard');
  if (!card) return;
  const MAX = 15; // max rotation degrees

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -MAX;
    const ry = ((e.clientX - cx) / (rect.width  / 2)) *  MAX;

    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

    // Parallax layers
    card.querySelectorAll('[data-depth]').forEach(el => {
      const d = +el.dataset.depth;
      el.style.setProperty('--d', d * (ry / MAX) * 20);
    });

    // Shine position
    const shine = card.querySelector('.tilt-shine');
    if (shine) {
      const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      shine.style.setProperty('--mx', mx + '%');
      shine.style.setProperty('--my', my + '%');
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0) rotateY(0)';
  });
})();
```

## 2. CSS 3D Card Flip

```html
<div class="flip-scene">
  <div class="flip-card" id="flipCard">
    <div class="flip-front">Front face content</div>
    <div class="flip-back">Back face content</div>
  </div>
</div>
```

```css
.flip-scene  { perspective: 1000px; }
.flip-card   { transform-style: preserve-3d; transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); position: relative; }
.flip-card.flipped { transform: rotateY(180deg); }
.flip-front, .flip-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  position: absolute; inset: 0;
  border-radius: 16px;
}
.flip-back { transform: rotateY(180deg); }
```

```js
document.getElementById('flipCard').addEventListener('click', function() {
  this.classList.toggle('flipped');
});
```

## 3. CSS 3D Cube

```html
<div class="cube-scene">
  <div class="cube" id="cube">
    <div class="face front">Front</div>
    <div class="face back">Back</div>
    <div class="face left">Left</div>
    <div class="face right">Right</div>
    <div class="face top">Top</div>
    <div class="face bottom">Bottom</div>
  </div>
</div>
```

```css
.cube-scene { perspective: 800px; display: flex; align-items: center; justify-content: center; }
.cube {
  width: 200px; height: 200px;
  transform-style: preserve-3d;
  animation: cubeRotate 12s linear infinite;
}
.face {
  position: absolute; width: 200px; height: 200px;
  display: flex; align-items: center; justify-content: center;
  background: oklch(14% 0.025 var(--h) / 0.8);
  border: 1px solid oklch(64% 0.22 var(--h) / 0.3);
  backdrop-filter: blur(10px);
  font-weight: 600; font-size: 18px;
}
.front  { transform: translateZ(100px); }
.back   { transform: rotateY(180deg) translateZ(100px); }
.left   { transform: rotateY(-90deg) translateZ(100px); }
.right  { transform: rotateY( 90deg) translateZ(100px); }
.top    { transform: rotateX( 90deg) translateZ(100px); }
.bottom { transform: rotateX(-90deg) translateZ(100px); }
@keyframes cubeRotate {
  0%   { transform: rotateX(15deg) rotateY(0deg); }
  100% { transform: rotateX(15deg) rotateY(360deg); }
}
```

## 4. 3D Isometric Layout

Give a dashboard a 3D isometric tilt — popular in app store screenshots and hero sections.

```css
.iso-scene {
  perspective: 2000px;
  perspective-origin: 50% 30%;
}
.iso-content {
  transform: rotateX(30deg) rotateZ(-15deg) scale(0.9);
  transform-style: preserve-3d;
  transform-origin: center center;
  /* Add shadow depth */
  filter: drop-shadow(0 60px 40px oklch(0% 0 0 / 0.5));
}
```

## 5. Gyroscope Tilt (mobile)

On mobile, use the device orientation API for the tilt effect.

```js
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (e) => {
    const rx = Math.max(-12, Math.min(12, e.beta  - 45)); // tilt forward/back
    const ry = Math.max(-12, Math.min(12, e.gamma));      // tilt left/right
    document.getElementById('tiltCard').style.transform =
      `rotateX(${rx * -0.5}deg) rotateY(${ry * 0.5}deg)`;
  });
}
```
