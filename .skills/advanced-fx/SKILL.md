---
name: advanced-fx
description: >
  Build technically complex, visually stunning HTML experiences: Three.js 3D scenes, CSS 3D perspective effects, Canvas 2D physics and particle systems, SVG procedural animations, drag-and-drop interfaces, command palettes, and interactive data simulations. Use this skill whenever the user asks for anything 3D, "like a real game engine", particle effects, physics, interactive canvas, procedural generation, morphing shapes, depth effects, tilt cards, WebGL, shaders, or anything that feels beyond standard CSS/HTML. Also use for complex functional components like drag-drop kanban, real-time simulations, or multi-layer interactive scenes. Pairs with ghostdev-landing and wow-app-ui — this skill is for the "impossible-looking" parts.
---

# Advanced FX — 3D, 2D, Functional

This skill is for effects that make people ask "how did you do that?" It covers three domains — CSS 3D, Canvas/WebGL, and complex functional interactions. Read the relevant reference file for complete implementation code.

## Selection Guide

| What you want | Technique | Reference |
|---|---|---|
| Cards that tilt with mouse | CSS 3D + JS tilt | `references/css-3d.md` |
| 3D flip, cube, isometric scene | CSS 3D preserve-3d | `references/css-3d.md` |
| Floating 3D geometry, particles in space | Three.js | `references/threejs.md` |
| Animated shader background | Three.js ShaderMaterial | `references/threejs.md` |
| Physics: balls, springs, gravity | Canvas 2D | `references/canvas-2d.md` |
| Particle network (connected dots) | Canvas 2D | `references/canvas-2d.md` |
| Procedural noise, generative art | Canvas 2D | `references/canvas-2d.md` |
| SVG morphing paths, animated diagrams | SVG/SMIL | `references/canvas-2d.md` |
| Drag & drop with snap / collision | Functional | `references/functional.md` |
| Command palette (Cmd+K) | Functional | `references/functional.md` |
| Infinite parallax scroll | Functional | `references/functional.md` |
| Multi-step wizard with transitions | Functional | `references/functional.md` |

## Core Principles

**3D:** Always set `perspective` on the *parent*, `transform-style: preserve-3d` on the *child*. The perspective value controls depth intensity — 400–600px feels dramatic, 1000–1200px feels subtle. For interactive tilt, clamp the rotation between ±15deg or it feels broken.

**Canvas:** Every canvas effect needs exactly three things: an init function, a draw function called by `requestAnimationFrame`, and a resize listener. Get this scaffold right first, then add content.

**WebGL/Three.js:** Load from CDN (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`). The minimal scene is: Renderer → Scene → Camera → Geometry → Material → Mesh → Lights → animate loop. Everything else is variation.

**Functional complexity:** Complex interactions (drag-drop, command palette, virtual scroll) all share one pattern: a central state object + a single render function that redraws from state. Never scatter state across DOM attributes.

## Animation Performance Rules

These apply to all techniques:
- Animate only `transform` and `opacity` on DOM elements (no width/height/top/left)
- Canvas and WebGL bypass this rule — they paint to a bitmap
- `will-change: transform` hints GPU layer promotion for CSS 3D
- Always include `prefers-reduced-motion` guard for ambient animations
- Target 60fps: each `requestAnimationFrame` tick must complete in < 16ms

## CDN Libraries (use these, don't npm-install)

```html
<!-- Three.js r128 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- GSAP (CSS animation on steroids) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

---

Read the reference file that matches your task. Each reference contains complete, runnable code patterns.
