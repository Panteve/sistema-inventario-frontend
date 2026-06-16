# CRM JS Patterns — Architecture Reference

## Complete App Shell (init + navigate + state)

```js
// ─── STATE ───────────────────────────────────────────────
let data = {
  records: [],           // adapt to domain: cases, clients, deals, tickets, etc.
  settings: { theme: 'dark', name: 'My App' }
};

function saveState() {
  try { localStorage.setItem('app_data', JSON.stringify(data)); } catch(e){}
}

function loadState() {
  try {
    const s = localStorage.getItem('app_data');
    if(s) { data = JSON.parse(s); return; }
  } catch(e){}
  seedData(); // first run
}

// ─── SEED DATA ────────────────────────────────────────────
function seedData() {
  data.records = [
    { id: 1, title: 'Example Record', status: 'active', date: '2026-01-15' },
    { id: 2, title: 'Another Record', status: 'pending', date: '2026-02-03' },
  ];
  // Add domain-specific fields here
  saveState();
}

// ─── NAVIGATION ──────────────────────────────────────────
function navigate(view) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show target
  const page = document.getElementById('page-' + view);
  if(page) page.classList.add('active');
  // Update nav highlight
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === view);
  });
  // Update breadcrumb
  const labels = {
    dashboard: 'Dashboard', cases: 'Cases', clients: 'Clients', 
    settings: 'Settings' /* extend as needed */
  };
  const bc = document.getElementById('breadcrumb-current');
  if(bc) bc.textContent = labels[view] || view;
  // Render the view
  const renderers = { dashboard: renderDashboard /* add others */ };
  if(renderers[view]) renderers[view]();
}

// ─── SIDEBAR TOGGLE ──────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ─── THEME ───────────────────────────────────────────────
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  data.settings.theme = isDark ? 'light' : 'dark';
  saveState();
}

// ─── KPI RENDER ──────────────────────────────────────────
function renderKPIs() {
  const kpis = [
    { icon: '<!-- SVG -->', color: 'rgba(96,165,250,.12)', label: 'Total Records', 
      value: data.records.length, change: '+12%', up: true },
    // add more KPIs
  ];
  const el = document.getElementById('kpi-container');
  if(!el) return;
  el.innerHTML = kpis.map((k, i) => `
    <div class="card kpi-card animate-fadeUp" style="animation-delay:${i*0.05}s">
      <div class="kpi-icon" style="background:${k.color}">${k.icon}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-change ${k.up ? 'up' : 'down'}">${k.up ? '↑' : '↓'} ${k.change} this month</div>
    </div>
  `).join('');
}

// ─── MODAL SYSTEM ────────────────────────────────────────
function openModal(title, body, footer = '') {
  document.getElementById('modal-title').innerHTML = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-footer').innerHTML = footer;
  document.getElementById('modal-overlay').classList.add('show');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}

// ─── COMMAND PALETTE ─────────────────────────────────────
const cmdItems = [
  { icon: '<!-- SVG -->', text: 'Go to Dashboard', sub: 'Main view', action: () => navigate('dashboard') },
  // add all navigation items here
];

let cmdSelectedIndex = 0;

function renderCmdResults(filter = '') {
  const f = filter.toLowerCase();
  const items = f ? cmdItems.filter(i => 
    i.text.toLowerCase().includes(f) || i.sub.toLowerCase().includes(f)
  ) : cmdItems;
  cmdSelectedIndex = 0;
  document.getElementById('cmd-results').innerHTML = items.map((item, i) => `
    <div class="cmd-item ${i === 0 ? 'selected' : ''}" 
         onclick="executeCmdItem(${cmdItems.indexOf(item)})" 
         onmouseenter="cmdSelectItem(${i})">
      ${item.icon}
      <div>
        <div class="cmd-item-text">${item.text}</div>
        <div class="cmd-item-sub">${item.sub}</div>
      </div>
    </div>
  `).join('') || '<div style="padding:16px;text-align:center;color:var(--text3);font-size:13px">No results</div>';
}

function filterCmdResults() { renderCmdResults(document.getElementById('cmd-input').value); }
function handleCmdKey(e) {
  const items = document.querySelectorAll('.cmd-item');
  if(e.key === 'ArrowDown') { e.preventDefault(); cmdSelectedIndex = Math.min(cmdSelectedIndex+1, items.length-1); }
  else if(e.key === 'ArrowUp') { e.preventDefault(); cmdSelectedIndex = Math.max(cmdSelectedIndex-1, 0); }
  else if(e.key === 'Enter') { e.preventDefault(); if(items[cmdSelectedIndex]) items[cmdSelectedIndex].click(); }
  else if(e.key === 'Escape') { closeCmdPalette(); }
  items.forEach((it, i) => it.classList.toggle('selected', i === cmdSelectedIndex));
}
function cmdSelectItem(i) { cmdSelectedIndex = i; document.querySelectorAll('.cmd-item').forEach((it, idx) => it.classList.toggle('selected', idx === i)); }
function executeCmdItem(index) { if(cmdItems[index]) { cmdItems[index].action(); closeCmdPalette(); } }
function openCmdPalette() { document.getElementById('cmd-overlay').classList.add('show'); document.getElementById('cmd-input').value = ''; document.getElementById('cmd-input').focus(); renderCmdResults(); }
function closeCmdPalette() { document.getElementById('cmd-overlay').classList.remove('show'); }

// ─── GLOBAL KEYBOARD ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); const o = document.getElementById('cmd-overlay'); if(o.classList.contains('show')) closeCmdPalette(); else openCmdPalette(); }
  if(e.key === 'Escape') { closeCmdPalette(); closeModal(); }
  // Number shortcuts: 1-9 navigate to views
  const isInput = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
  if(!isInput && e.key >= '1' && e.key <= '9') {
    const views = ['dashboard', 'cases', 'clients', 'tasks', 'calendar', 'documents', 'reports', 'settings'];
    const idx = parseInt(e.key) - 1;
    if(views[idx]) navigate(views[idx]);
  }
});

// ─── INIT ─────────────────────────────────────────────────
function init() {
  loadState();
  if(data.settings.theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  navigate('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
```

## Animation Utilities

```css
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes slideRight{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.animate-fadeUp{animation:fadeUp .5s ease both}
.animate-scaleIn{animation:scaleIn .3s ease both}
.animate-slideRight{animation:slideRight .4s ease both}
.stagger>*:nth-child(1){animation-delay:.05s}
.stagger>*:nth-child(2){animation-delay:.1s}
.stagger>*:nth-child(3){animation-delay:.15s}
.stagger>*:nth-child(4){animation-delay:.2s}
.stagger>*:nth-child(5){animation-delay:.25s}
.stagger>*:nth-child(6){animation-delay:.3s}
```

## Canvas Charts

### Bar Chart
```js
function drawBarChart() {
  const canvas = document.getElementById('barChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const data = [
    {label:'Jan',value:42},{label:'Feb',value:67},{label:'Mar',value:54},
    {label:'Apr',value:89},{label:'May',value:73},{label:'Jun',value:95}
  ];
  const max = Math.max(...data.map(d => d.value));
  const pad = {top:20,right:20,bottom:40,left:40};
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = chartW / data.length * 0.6;
  const gap = chartW / data.length;
  ctx.clearRect(0,0,W,H);
  // Y grid lines
  for(let i=0;i<=4;i++){
    const y = pad.top + chartH * (1 - i/4);
    ctx.strokeStyle = 'rgba(255,255,255,.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(W-pad.right,y);ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.font = '11px Inter';
    ctx.fillText(Math.round(max*i/4), 4, y+4);
  }
  // Bars
  data.forEach((d,i) => {
    const x = pad.left + gap*i + (gap-barW)/2;
    const barH = (d.value/max) * chartH;
    const y = pad.top + chartH - barH;
    const grad = ctx.createLinearGradient(x,y,x,y+barH);
    grad.addColorStop(0,'rgba(99,102,241,.9)');
    grad.addColorStop(1,'rgba(99,102,241,.3)');
    ctx.fillStyle = grad;
    const r = Math.min(6, barW/2);
    ctx.beginPath();
    ctx.moveTo(x+r,y);ctx.lineTo(x+barW-r,y);ctx.quadraticCurveTo(x+barW,y,x+barW,y+r);
    ctx.lineTo(x+barW,y+barH);ctx.lineTo(x,y+barH);ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x+barW/2, H-10);
  });
}
```

### Donut/Pie Chart
```js
function drawPieChart() {
  const canvas = document.getElementById('pieChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const cx = W/2, cy = H/2, radius = Math.min(W,H)*0.35;
  const segments = [
    {label:'Active', value:45, color:'rgba(99,102,241,.9)'},
    {label:'Pending', value:25, color:'rgba(251,191,36,.9)'},
    {label:'Closed', value:20, color:'rgba(52,211,153,.9)'},
    {label:'Other', value:10, color:'rgba(148,163,184,.5)'},
  ];
  const total = segments.reduce((s,d) => s+d.value, 0);
  ctx.clearRect(0,0,W,H);
  let startAngle = -Math.PI/2;
  const innerRadius = radius * 0.55;
  segments.forEach(seg => {
    const sliceAngle = (seg.value/total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,radius,startAngle,startAngle+sliceAngle);
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += sliceAngle;
  });
  // Donut hole
  ctx.beginPath();ctx.arc(cx,cy,innerRadius,0,Math.PI*2);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#111827';
  ctx.fill();
  // Center label
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.font = 'bold 24px Inter';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(total, cx, cy-8);
  ctx.font = '11px Inter';ctx.fillStyle='rgba(255,255,255,.4)';
  ctx.fillText('Total', cx, cy+14);
}
```
