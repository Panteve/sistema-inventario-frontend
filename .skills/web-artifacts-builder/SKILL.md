---
name: web-artifacts-builder
description: Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.
license: Complete terms in LICENSE.txt
---

# Web Artifacts Builder

To build powerful frontend claude.ai artifacts, follow these steps:
1. Initialize the frontend repo using `scripts/init-artifact.sh`
2. Develop your artifact by editing the generated code
3. Bundle all code into a single HTML file using `scripts/bundle-artifact.sh`
4. Display artifact to user
5. (Optional) Test the artifact

**Stack**: React 18 + TypeScript + Vite + Parcel (bundling) + Tailwind CSS + shadcn/ui

## Design & Style Guidelines

VERY IMPORTANT: To avoid what is often referred to as "AI slop", avoid using excessive centered layouts, purple gradients, uniform rounded corners, and Inter font.

## Quick Start

### Step 1: Initialize Project

Run the initialization script to create a new React project:
```bash
bash scripts/init-artifact.sh <project-name>
cd <project-name>
```

This creates a fully configured project with:
- ✅ React + TypeScript (via Vite)
- ✅ Tailwind CSS 3.4.1 with shadcn/ui theming system
- ✅ Path aliases (`@/`) configured
- ✅ 40+ shadcn/ui components pre-installed
- ✅ All Radix UI dependencies included
- ✅ Parcel configured for bundling (via .parcelrc)
- ✅ Node 18+ compatibility (auto-detects and pins Vite version)

### Step 2: Develop Your Artifact

To build the artifact, edit the generated files. See **Common Development Tasks** below for guidance.

### Step 3: Bundle to Single HTML File

To bundle the React app into a single HTML artifact:
```bash
bash scripts/bundle-artifact.sh
```

This creates `bundle.html` - a self-contained artifact with all JavaScript, CSS, and dependencies inlined. This file can be directly shared in Claude conversations as an artifact.

**Requirements**: Your project must have an `index.html` in the root directory.

**What the script does**:
- Installs bundling dependencies (parcel, @parcel/config-default, parcel-resolver-tspaths, html-inline)
- Creates `.parcelrc` config with path alias support
- Builds with Parcel (no source maps)
- Inlines all assets into single HTML using html-inline

### Step 4: Share Artifact with User

Finally, share the bundled HTML file in conversation with the user so they can view it as an artifact.

### Step 5: Testing/Visualizing the Artifact (Optional)

Note: This is a completely optional step. Only perform if necessary or requested.

To test/visualize the artifact, use available tools (including other Skills or built-in tools like Playwright or Puppeteer). In general, avoid testing the artifact upfront as it adds latency between the request and when the finished artifact can be seen. Test later, after presenting the artifact, if requested or if issues arise.

## Reference

- **shadcn/ui components**: https://ui.shadcn.com/docs/components
---

## Design Quality Standards

When building HTML artifacts (landing pages, dashboards, marketing sites), apply these standards to avoid "AI slop" appearance:

### Token System
- Use **oklch** color tokens with a single `--h` hue anchor variable
- Define `--section: clamp(72px, 9vw, 120px)` for consistent vertical rhythm
- Never use raw hex colors in the design layer — always CSS custom properties

### Visual Texture
- Add `feTurbulence` noise overlay (SVG filter + fixed div at opacity 0.025)
- Use `radial-gradient` orbs in `body::before` for atmospheric depth
- Use dot grid in `body::after` with `mask-image` to fade edges

### Typography
- Pair **Playfair Display italic** (emotional headers) with **Inter 900** (structural labels)
- Use `clamp()` for all font sizes — no fixed px hero type
- Gradient clip-text for hero serif accents (`-webkit-background-clip: text`)

### Interactions
- Custom scrollbar: `width: 5px`, accent color
- Glassmorphism cards: `backdrop-filter: blur`, gradient top border, hover lift
- Scroll reveal: `IntersectionObserver` on `.reveal` class
- Mouse parallax on hero orbs via `mousemove`

### Accessibility
- `focus-visible` outline for keyboard nav
- `focus:not(focus-visible)` to hide focus ring for mouse users
- `prefers-reduced-motion` guard on all animations

### CTA Architecture
Every page needs a 3-level intent ramp:
1. **Nav** — low commitment ("See pricing")
2. **Hero** — medium commitment ("Start free trial")
3. **Final section** — high commitment ("Get started now" with pulsing rings)

### Code Hygiene
- No `onclick=` inline handlers in new code — use `data-action` + event delegation
- No `alert()` calls — use inline toast notification UI
- No `--accent-2` or second hue — use lightness/chroma variants of `--h`

> For a complete CSS/JS reference, see the `ghostdev-landing` skill.
