---
name: startup-grade-landing
description: >
  Meta-skill that governs the QUALITY BAR for any landing page, marketing site, dashboard, or app UI — apply it ALONGSIDE whichever visual-style skill you pick (ghostdev-landing, fintech-saas-landing, editorial-bold-landing, advanced-fx, product-pdp-adaptive, crm-dashboard-builder). Use this whenever the user asks for a landing page, "algo bonito", "mejora esto", a CRM/app UI, or anything visual — even a one-line prompt — and treat that one-line prompt as if the user had handed you a 10-page creative brief from a 3-year-old startup with a senior in-house design/eng team. The job is to produce something that does NOT read as AI-generated: no fake stats, no decorative soup, no dead buttons, one coherent color system, and at least one genuinely interactive feature tied to the actual product. Trigger this on every visual build/edit task, before and during use of any other design skill.
---

# Startup-Grade Quality Bar

This skill exists because an audit of past output found a recurring set of "AI slop" tells that make pages look generated rather than designed. Read this FIRST, then apply the relevant visual-style skill underneath it. The goal: a one-line prompt like "hazme una landing para una app de finanzas" should produce something that feels like it came out of a funded startup's third design sprint — specific, restrained, and a little surprising — not a template.

## 0. Before writing any code: invent the company for real

Spend one paragraph (in your own head, not necessarily shown to the user) deciding:
- **Who is this for, specifically?** Not "businesses" — pick a narrow persona (e.g. "ortodoncistas independientes en México con 1-3 sucursales").
- **What's the one mechanism that makes this product different?** Every section should trace back to it. If you can't name it, the page will default to generic SaaS phrasing.
- **What does this company sound like?** Pick a voice (clinical/precise, warm/direct, technical/confident) and hold it for every headline and button label. Mixing "¡Únete ahora!" energy with "Optimiza tu flujo operativo" corporate-speak in the same page is a tell.

If the user gave you a real product (their own app, an existing folder like GradeDesk/KíppiLex), pull real specifics from it — actual feature names, actual data shapes, actual terminology — instead of inventing generic ones.

## 1. Kill fake social proof

Audits repeatedly found fabricated stats and logos presented as fact: "12,000+ estudiantes", "2,400+ abogados activos", "4.9/5 · 312 reviews", scrolling marquees of made-up company/firm names ("Bufete Herrera", "Colegio San Marcos"). This is the single fastest way to make a page feel fake, because the numbers are suspiciously round and unverifiable.

- If the product is pre-launch or has no real customers yet, **don't fabricate social proof**. Replace it with something true-feeling instead: a founder's note, a "how it works" walkthrough, a roadmap, a waitlist counter that's framed as aspirational ("Sé de los primeros 100"), or just remove the section.
- If you must show metrics (e.g. for a dashboard demo), make them feel like a SPECIFIC moment in time with texture — odd numbers, not round ones (`1,847` not `2,000+`), and tie them to a date or context shown elsewhere on the page.
- Logo bars: only include if the user gives you real names, or skip entirely. A page with NO social proof section reads more credible than one with obviously invented testimonials.

## 2. One ambient decoration, max two

Multiple audits found heroes stacked with 3-4 simultaneous decorative layers doing the same job: a particle canvas + a radial glow + an animated grid floor + floating icon badges + an aurora canvas + a cursor-glow blob + noise texture + a dot-grid mask, all at once, all `pointer-events:none`, none connected to content.

- Pick **ONE** signature ambient effect for the whole page (a grid floor, OR a particle field, OR an aurora blob — not all three) and use it ONLY in the hero, not bolted onto a CRM dashboard where it competes with data the user needs to read.
- Floating decorative icon cards in a hero must relate to the actual product (real feature icons, not generic chart/shield/calendar/lock icons with no caption).
- On dashboards, dense data tables, and CRMs: ZERO ambient decoration. The job of that screen is legibility. Save atmosphere for marketing pages.
- Before adding an effect, ask: "if I removed this, would the page communicate less?" If no, cut it.

## 3. Every CTA must do something

Dead `href="#"` links on primary buttons (Iniciar sesión, Crear cuenta, Agendar demo, nav items) were the most common functional tell across every file audited.

- Primary CTAs should at minimum smooth-scroll to a real section, open a real modal/form, or — if genuinely out of scope — be visually de-emphasized (ghost button, "próximamente" microcopy) rather than presented as a working primary action.
- Never use `alert('...')` as a stand-in for a feature ("Descarga simulada", "Guía de tallas"). Either build the real lightweight version (a CSS modal, an inline panel) or don't show the control.
- If you embed a "live demo" (like an iframe dashboard), make sure it's actually the real interactive thing — that pattern tested very well and should be the default for any "ver cómo funciona" section, not a static screenshot or skeleton-bar wireframe.

## 4. One color system, no overlay collisions

The worst-rated files had a "premium upgrade" overlay (aurora canvas + violet `oklch(62% 0.20 264)` accent + glassmorphism) pasted on top of an existing page with its own accent color and theme (light vs dark), forcing `!important` overrides that fought the base styles — e.g. a light-themed CRM with badge colors designed for white cards got body background forced to near-black, killing contrast.

- When upgrading an existing file, **read its existing `:root` tokens and theme mode first**, and adapt your additions to extend that system — don't paste a self-contained "skin" with its own competing tokens.
- Pick ONE accent hue for the whole product. Don't let financial/KPI numbers render in a different color family (e.g. violet gradient text) than badges/status pills (e.g. blue/green/red) elsewhere on the same screen.
- Avoid the specific cliché of `linear-gradient(135deg, var(--accent), #a78bfa)` for every avatar/icon — repeating one gradient on every circular element is the most recognizable "AI SaaS" signature. Vary treatment: solid fills, initials on flat color, outline icons, photos.
- Match typography to data type: don't set financial/tabular numbers in an italic display serif (Playfair etc.) — that's for emotional headline moments, not a KPI grid the user needs to scan.

## 5. Icons: pick one system and stay in it

Mixing raw emoji (📊✅👥⚠️) with a custom SVG icon sprite on the same nav/feature list was flagged repeatedly as "unfinished AI scaffold." Pick either a custom SVG sprite (preferred for anything "premium") or a single icon library, and use it everywhere — including in places added later/iteratively. When extending an existing page, grep for the existing icon pattern first and match it.

## 6. Build ONE real interactive feature, not a static page

This is what separates "looks like a template" from "looks like a product." For every build, include at least one piece of UI that actually computes/responds to user input and is core to the product's value prop — not just scroll animations. Examples by product type:

- **Education / LMS**: an embedded live dashboard demo (real iframe or real component with state) — already proven to work well.
- **Fintech / SaaS analytics**: an interactive calculator/estimator (e.g. "cuánto ahorras al mes") that recomputes a number on input, or a mini chart that responds to a toggle (timeframe, plan tier).
- **E-commerce / PDP**: the color-adaptive variant switcher (proven pattern) — repaints background/accent/product art together.
- **CRM / internal tool**: real view-switching with state (tabs, kanban drag-drop, modals, localStorage), seeded with domain-specific realistic data (correct currency/locale, plausible names, correct terminology) — not generic "Lorem client" placeholders.
- **Generic landing with no obvious "tool"**: a pricing toggle (monthly/annual that recalculates), an interactive FAQ/comparison table, or a configurator.

If you genuinely can't fit a real interactive feature, say so explicitly to the user rather than shipping a purely decorative scroll page and calling it done.

## 7. Copy: ban the boilerplate

Flagged generic phrases to avoid (and what to do instead):
- "Empower your business / Unlock the future / Lleva tu negocio al siguiente nivel" → name the specific outcome and the specific mechanism ("Califica 30 estudiantes en 4 minutos, sin internet").
- "El [producto] que tu [audiencia] necesita para crecer de verdad" → this exact template has been overused; write the headline as if explaining to a friend what's broken about the status quo and what changes.
- Anti-cliché clichés ("Sin templates. Sin compromiso con la mediocridad.") → these read as performative now too. Specificity beats attitude.
- Placeholder portfolio items / project names with flat gradient swatches as "thumbnails" → either use real content/screenshots the user provides, or design the section so it doesn't need fake thumbnails (e.g. a list with real descriptions instead of a visual grid).

## 8. Final pass — the senior-eye checklist

Before calling it done, check:
1. Could every stat/logo/testimonial on this page survive someone googling it? If not, cut or reframe.
2. Count the ambient decoration layers in the hero. More than 2? Cut.
3. Click (mentally) every button/link. Does each do something real or honestly look disabled/secondary?
4. Is there exactly one accent color family used consistently for interactive elements, and is data typography (numbers, tables) legible and NOT in a display serif?
5. Are icons one consistent system (no emoji + SVG mix)?
6. Is there at least one feature that computes/responds to input?
7. Read the three biggest headlines out loud — would a human writer at this specific company plausibly write this, or could it be pasted into any competitor's site unchanged? If the latter, rewrite with product-specific language.

Apply this checklist silently as part of the build — don't show it to the user — but let it shape every section before you write the final HTML.
