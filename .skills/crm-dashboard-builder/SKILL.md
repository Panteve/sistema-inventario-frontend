---
name: crm-dashboard-builder
description: >
  Build production-grade SPA CRM/dashboard apps as a single HTML file: collapsible sidebar, topbar with breadcrumb and search, animated KPI cards, kanban board (drag-drop), data tables with modals, Cmd+K command palette, light/dark theme toggle, localStorage persistence. Use this skill whenever the user wants a CRM, dashboard, admin panel, internal tool, case management system, legal software, business ops app, or any multi-view SPA with navigation. Triggers on: "CRM", "dashboard", "admin panel", "internal tool", "sidebar navigation", "kanban", "data tables", "command palette", "case management", "legal CRM", "operations dashboard", "business app". Pairs with advanced-fx for visual effects layer.
---

# CRM Dashboard Builder

This skill builds full-featured SPA CRM/dashboard apps — everything in one HTML file, zero dependencies except Google Fonts. These apps look like real SaaS products.

See `references/design-system.md` for CSS variables and tokens, `references/components.md` for every component pattern, and `references/patterns.md` for JS architecture patterns.

## Architecture at a Glance

```
index.html
├── <style>          CSS variables + reset + all component styles
├── <body>
│   ├── .layout      flex row: sidebar + main
│   │   ├── .sidebar collapsible nav (260px → 68px)
│   │   └── .main    flex col: topbar + .content
│   │       ├── .topbar  breadcrumb + search + actions
│   │       └── #pages   all views, one active at a time
│   └── .cmd-overlay Cmd+K palette (fixed, hidden)
└── <script>
    ├── const data   all app state (loaded from localStorage or seed)
    ├── render*()    one function per view/component
    ├── init()       seed data + render dashboard
    └── navigate()   show/hide pages
```

## Design System Tokens

```css
:root {
  /* Colors */
  --bg: #0A0F1E;          /* page background */
  --surface: #111827;     /* sidebar, topbar, cards */
  --surface2: #1a2236;    /* hover states */
  --surface3: #1e2a42;    /* nested surfaces */
  --border: rgba(129,140,248,.15);
  --border2: rgba(129,140,248,.25);
  --text: #e2e8f0;
  --text2: #94a3b8;
  --text3: #64748b;
  --accent: #818CF8;      /* primary action color */
  --accent2: #6366f1;
  --accent3: #4f46e5;
  --success: #34d399;
  --warning: #fbbf24;
  --danger: #f87171;
  --info: #60a5fa;
  --glass: rgba(17,24,39,.7);
  --shadow: 0 8px 32px rgba(0,0,0,.4);
  --radius: 12px;
  --radius2: 16px;
  --sidebar: 260px;
  --sidebar-collapsed: 68px;
  --topbar: 64px;
  --font: 'Inter', sans-serif;
  --font-heading: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* Light theme override */
[data-theme="light"] {
  --bg: #F7F8FA;
  --surface: #FFFFFF;
  --surface2: #F1F3F7;
  --surface3: #E8EBF0;
  --border: rgba(0,0,0,.08);
  --border2: rgba(0,0,0,.15);
  --text: #1e293b;
  --text2: #475569;
  --text3: #94a3b8;
  --accent: #6366f1;
  --glass: rgba(255,255,255,.8);
  --shadow: 0 8px 32px rgba(0,0,0,.08);
}
```

## Read Reference Files

- **`references/design-system.md`** — full CSS reset, base styles, animation utilities, responsive rules
- **`references/components.md`** — complete code for: sidebar, topbar, KPI cards, kanban, data table, modal, command palette, charts (canvas bar + pie), settings panel
- **`references/patterns.md`** — JS architecture: state management, localStorage, router, seed data, render pattern, keyboard shortcuts

## Quick Component Reference

### Sidebar (collapsible)
```html
<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo"><!-- SVG icon --></div>
    <span class="sidebar-brand">AppName</span>
    <button class="sidebar-toggle" onclick="toggleSidebar()"><!-- chevron SVG --></button>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-section">Main</div>
    <a class="nav-item active" onclick="navigate('dashboard')">
      <!-- SVG icon --><span>Dashboard</span>
    </a>
    <!-- more nav-items -->
  </nav>
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="sidebar-user-avatar">JD</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">Jane Doe</div>
        <div class="sidebar-user-role">Administrator</div>
      </div>
    </div>
  </div>
</aside>
```

Toggle: `sidebar.classList.toggle('collapsed')`

### KPI Card
```html
<div class="card kpi-card animate-fadeUp" style="animation-delay:.05s">
  <div class="kpi-icon" style="background:rgba(96,165,250,.12)"><!-- SVG --></div>
  <div class="kpi-value" data-count="247">0</div>
  <div class="kpi-label">Active Cases</div>
  <div class="kpi-change up">↑ 12% this month</div>
</div>
```

Always render KPI cards via JS: `document.getElementById('kpi-container').innerHTML = kpis.map(renderKpiCard).join('')`

### Command Palette (Cmd+K)
```html
<div class="cmd-overlay" id="cmd-overlay">
  <div class="cmd-modal">
    <div class="cmd-search">
      <svg><!-- search icon --></svg>
      <input id="cmd-input" placeholder="Search or type a command…" 
             oninput="filterCmdResults()" onkeydown="handleCmdKey(event)">
      <kbd>ESC</kbd>
    </div>
    <div class="cmd-results" id="cmd-results"></div>
  </div>
</div>
```

```js
document.addEventListener('keydown', e => {
  if((e.ctrlKey || e.metaKey) && e.key === 'k'){
    e.preventDefault();
    document.getElementById('cmd-overlay').classList.toggle('show');
  }
});
```

### Modal System
```js
function openModal(title, body, footer){
  document.getElementById('modal-title').innerHTML = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-footer').innerHTML = footer;
  document.getElementById('modal-overlay').classList.add('show');
}
function closeModal(){
  document.getElementById('modal-overlay').classList.remove('show');
}
```

## State & Data Pattern

```js
// Central state
let data = {
  cases: [],
  clients: [],
  tasks: [],
  documents: [],
  settings: { theme: 'dark', firmName: 'My Firm' }
};

// Persist to localStorage
function saveState(){ localStorage.setItem('crm_data', JSON.stringify(data)); }
function loadState(){
  try {
    const s = localStorage.getItem('crm_data');
    if(s) data = JSON.parse(s);
    else seedData();
  } catch(e){ seedData(); }
}

// Navigation
function navigate(view){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-'+view).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === view);
  });
  // Render the active view
  const renderers = { dashboard: renderDashboard, cases: renderCases, /* etc */ };
  if(renderers[view]) renderers[view]();
}
```

## Domain-Specific Adaptations

**Legal CRM:** Replace "cases" with legal cases (expedientes), add "actuaciones" timeline, "poderes" (POA), hearing dates. Sidebar: casos, clientes, agenda, actuaciones, documentos, tareas, mensajes, reportes.

**Sales CRM:** Pipeline kanban (Prospecto → Contactado → Propuesta → Negociación → Cerrado), deals with value, conversion funnel chart.

**Project Management:** Projects + tasks (kanban by status), team members, time tracking.

**Support/Helpdesk:** Tickets by priority, SLA indicators, customer satisfaction scores, agent assignment.

**Healthcare:** Patients, appointments calendar, prescriptions, billing.

The pattern is always the same — adapt the data schema, nav items, and view content. The shell (sidebar + topbar + KPI + command palette + modal + state pattern) is universal.

## gd-advanced-fx Integration

After building the CRM, add the visual FX overlay before `</body>`:

```html
<style id="gd-advanced-fx">
#gdAuroraCanvas{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.7}
.gd-cursor-glow{position:fixed;pointer-events:none;z-index:0;width:480px;height:480px;border-radius:50%;
  background:radial-gradient(circle,oklch(62% 0.20 264 / 0.04) 0%,transparent 70%);
  transform:translate(-240px,-240px);will-change:transform}
.kpi-card,.stat-card{transform-style:preserve-3d;will-change:transform;transition:transform .08s ease}
</style>
<div class="gd-cursor-glow" id="gdCursorGlow" aria-hidden="true"></div>
<script>
(function(){
  var rm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var cg=document.getElementById('gdCursorGlow');
  if(cg&&!rm)document.addEventListener('mousemove',function(e){
    cg.style.transform='translate('+(e.clientX-240)+'px,'+(e.clientY-240)+'px)';
  },{passive:true});
  function applyTilt(){
    if(!rm)document.querySelectorAll('.kpi-card,.stat-card').forEach(function(card){
      card.addEventListener('mousemove',function(e){
        var r=card.getBoundingClientRect();
        card.style.transform='rotateX('+(((e.clientY-r.top-r.height/2)/(r.height/2))*-8)+'deg) rotateY('+(((e.clientX-r.left-r.width/2)/(r.width/2))*8)+'deg) translateZ(4px)';
      },{passive:true});
      card.addEventListener('mouseleave',function(){ card.style.transform=''; });
    });
  }
  document.addEventListener('DOMContentLoaded',function(){ setTimeout(applyTilt,500); });
  (function(){
    var canvas=document.createElement('canvas');canvas.id='gdAuroraCanvas';
    document.body.insertBefore(canvas,document.body.firstChild);
    var ctx=canvas.getContext('2d'),W,H;
    var orbs=[{x:.15,y:.1,w:.55,h:.45,op:.06,spd:22000,phase:0},{x:.80,y:.80,w:.45,h:.38,op:.04,spd:28000,phase:Math.PI}];
    function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
    function draw(t){
      ctx.clearRect(0,0,W,H);
      orbs.forEach(function(o){
        var off=Math.sin(t/o.spd*Math.PI*2+o.phase)*.04,
            cx=(o.x+off)*W,cy=(o.y+off)*H,rw=o.w*W,rh=o.h*H,
            grad=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(rw,rh)*.7);
        grad.addColorStop(0,'rgba(99,102,241,'+o.op+')');
        grad.addColorStop(1,'rgba(99,102,241,0)');
        ctx.save();ctx.scale(1,rh/rw);
        ctx.beginPath();ctx.arc(cx,cy*(rw/rh),rw*.7,0,6.283);
        ctx.fillStyle=grad;ctx.fill();ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(draw);
  })();
})();
</script>
```
