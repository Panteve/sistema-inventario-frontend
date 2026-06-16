# Complex Functional Patterns

## 1. Command Palette (Cmd+K)

The single most "senior dev tool" feature. Makes any app feel like Linear/Notion.

```html
<div id="cmdPalette" class="cmd-overlay" hidden>
  <div class="cmd-modal">
    <div class="cmd-search-wrap">
      <span class="cmd-icon">⌘</span>
      <input id="cmdInput" class="cmd-input" placeholder="Search commands…" autocomplete="off"/>
    </div>
    <div id="cmdResults" class="cmd-results"></div>
  </div>
</div>
```

```css
.cmd-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: oklch(0% 0 0 / 0.6);
  backdrop-filter: blur(6px);
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 15vh;
  animation: cmdFadeIn 0.15s ease;
}
.cmd-overlay[hidden] { display: none; }
.cmd-modal {
  width: min(580px, 90vw);
  background: oklch(13% 0.025 var(--h, 244));
  border: 1px solid oklch(100% 0 0 / 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 32px 64px oklch(0% 0 0 / 0.6);
  animation: cmdSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.cmd-search-wrap {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid oklch(100% 0 0 / 0.07);
}
.cmd-icon  { font-size: 18px; color: oklch(70% 0.15 var(--h, 244)); }
.cmd-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 16px; font-weight: 500; color: oklch(95% 0.005 var(--h, 244));
}
.cmd-input::placeholder { color: oklch(55% 0.010 var(--h, 244)); }
.cmd-results { max-height: 400px; overflow-y: auto; padding: 8px; }
.cmd-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: 8px; cursor: pointer;
  font-size: 14px; font-weight: 500; color: oklch(85% 0.008 var(--h, 244));
  transition: background 0.1s ease;
}
.cmd-item:hover, .cmd-item.selected {
  background: oklch(64% 0.22 var(--h, 244) / 0.12);
  color: oklch(95% 0.005 var(--h, 244));
}
.cmd-item-icon { width: 20px; text-align: center; opacity: 0.6; }
.cmd-item-shortcut {
  margin-left: auto; font-size: 11px; opacity: 0.4;
  font-family: monospace; letter-spacing: 0.04em;
}
@keyframes cmdFadeIn  { from{opacity:0} to{opacity:1} }
@keyframes cmdSlideIn { from{opacity:0;transform:scale(0.95) translateY(-10px)} to{opacity:1;transform:none} }
```

```js
(function() {
  const COMMANDS = [
    { icon: '🏠', label: 'Go to Dashboard',      shortcut: 'G D', action: () => navigate('dashboard') },
    { icon: '📋', label: 'View all projects',     shortcut: 'G P', action: () => navigate('projects')  },
    { icon: '⚙️', label: 'Open settings',         shortcut: 'G S', action: () => navigate('settings')  },
    { icon: '🌙', label: 'Toggle dark mode',       shortcut: '',    action: toggleTheme },
    { icon: '➕', label: 'Create new item',        shortcut: 'N',   action: openCreateModal },
    { icon: '🔍', label: 'Search everything',     shortcut: '/',   action: () => {} },
  ];

  const overlay = document.getElementById('cmdPalette');
  const input   = document.getElementById('cmdInput');
  const results = document.getElementById('cmdResults');
  let selected  = 0;

  function open() {
    overlay.hidden = false;
    input.value = '';
    render('');
    setTimeout(() => input.focus(), 10);
  }
  function close() { overlay.hidden = true; }

  function render(query) {
    const q = query.toLowerCase();
    const items = COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    selected = 0;
    results.innerHTML = items.map((c, i) => `
      <div class="cmd-item${i===0?' selected':''}" data-idx="${i}">
        <span class="cmd-item-icon">${c.icon}</span>
        <span>${c.label}</span>
        ${c.shortcut ? `<kbd class="cmd-item-shortcut">${c.shortcut}</kbd>` : ''}
      </div>
    `).join('');
    results._items = items;
  }

  input.addEventListener('input', e => render(e.target.value));

  input.addEventListener('keydown', e => {
    const items = results.querySelectorAll('.cmd-item');
    if (e.key === 'ArrowDown') { e.preventDefault(); selected = Math.min(selected+1, items.length-1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); selected = Math.max(selected-1, 0); }
    items.forEach((el, i) => el.classList.toggle('selected', i === selected));
    if (e.key === 'Enter' && results._items[selected]) {
      results._items[selected].action(); close();
    }
    if (e.key === 'Escape') close();
  });

  results.addEventListener('click', e => {
    const item = e.target.closest('.cmd-item');
    if (item) { results._items[+item.dataset.idx].action(); close(); }
  });

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); overlay.hidden ? open() : close(); }
  });
})();
```

## 2. Drag & Drop with Snap Zones

```js
(function() {
  let dragging = null, offsetX = 0, offsetY = 0;

  document.addEventListener('mousedown', e => {
    const el = e.target.closest('[data-draggable]');
    if (!el) return;
    dragging = el;
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.style.transition = 'none';
    el.style.zIndex = 1000;
    el.classList.add('dragging');
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    dragging.style.position = 'fixed';
    dragging.style.left = (e.clientX - offsetX) + 'px';
    dragging.style.top  = (e.clientY - offsetY) + 'px';

    // Highlight snap zones
    document.querySelectorAll('[data-drop-zone]').forEach(zone => {
      const r = zone.getBoundingClientRect();
      const over = e.clientX > r.left && e.clientX < r.right &&
                   e.clientY > r.top  && e.clientY < r.bottom;
      zone.classList.toggle('drop-hover', over);
    });
  });

  document.addEventListener('mouseup', e => {
    if (!dragging) return;

    // Find drop zone under cursor
    const zone = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop-zone]');
    if (zone) {
      zone.appendChild(dragging);
      dragging.style.cssText = ''; // reset inline styles
    } else {
      dragging.style.transition = 'all 0.3s ease';
      dragging.style.left = ''; dragging.style.top = ''; dragging.style.position = '';
    }

    dragging.classList.remove('dragging');
    document.querySelectorAll('[data-drop-zone]').forEach(z => z.classList.remove('drop-hover'));
    dragging = null;
  });
})();
```

## 3. Infinite Parallax Scroll

Elements at different depths scroll at different speeds — adds depth to long pages.

```js
(function() {
  const layers = [
    { selector: '.parallax-slow',   speed: 0.2 },
    { selector: '.parallax-medium', speed: 0.5 },
    { selector: '.parallax-fast',   speed: 0.8 },
  ];

  function update() {
    const scrollY = window.pageYOffset;
    layers.forEach(({ selector, speed }) => {
      document.querySelectorAll(selector).forEach(el => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (window.innerHeight / 2 - center) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
```

## 4. Multi-Step Wizard with Progress

```html
<div class="wizard" id="wizard">
  <div class="wizard-progress">
    <div class="wizard-bar" id="wizardBar"></div>
  </div>
  <div class="wizard-steps" id="wizardSteps">
    <div class="wizard-step" data-step="1"> Step 1 content </div>
    <div class="wizard-step" data-step="2"> Step 2 content </div>
    <div class="wizard-step" data-step="3"> Step 3 content </div>
  </div>
  <div class="wizard-nav">
    <button class="btn btn-ghost" id="wizBack">Back</button>
    <button class="btn btn-primary" id="wizNext">Continue →</button>
  </div>
</div>
```

```js
(function() {
  const steps = document.querySelectorAll('.wizard-step');
  const bar = document.getElementById('wizardBar');
  let current = 0;

  function go(n) {
    steps[current].classList.remove('active');
    steps[current].style.animation = 'stepOut 0.3s ease forwards';

    current = Math.max(0, Math.min(n, steps.length - 1));

    steps[current].classList.add('active');
    steps[current].style.animation = 'stepIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards';
    bar.style.width = ((current + 1) / steps.length * 100) + '%';

    document.getElementById('wizBack').hidden = current === 0;
    document.getElementById('wizNext').textContent =
      current === steps.length - 1 ? 'Finish ✓' : 'Continue →';
  }

  document.getElementById('wizNext').addEventListener('click', () =>
    current < steps.length - 1 ? go(current + 1) : alert('Done!'));
  document.getElementById('wizBack').addEventListener('click', () => go(current - 1));

  go(0);
})();
```

```css
.wizard-progress { height: 3px; background: oklch(20% 0.020 var(--h, 244)); border-radius: 3px; margin-bottom: 32px; overflow: hidden; }
.wizard-bar { height: 100%; background: var(--accent, oklch(64% 0.22 244)); border-radius: 3px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }
.wizard-step { display: none; }
.wizard-step.active { display: block; }
@keyframes stepIn  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
@keyframes stepOut { to{opacity:0;transform:translateX(-20px)} }
```

## 5. Virtual Scroll (render only visible rows)

For tables with 10,000+ rows — renders only what's on screen.

```js
(function() {
  const ITEM_H = 48;
  const BUFFER = 5; // extra rows above/below viewport
  const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}`, value: Math.random().toFixed(2) }));

  const container = document.getElementById('virtualList');
  const inner = document.createElement('div');
  inner.style.height = (data.length * ITEM_H) + 'px';
  inner.style.position = 'relative';
  container.appendChild(inner);

  function render() {
    const scrollTop = container.scrollTop;
    const viewH = container.clientHeight;
    const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - BUFFER);
    const end   = Math.min(data.length, Math.ceil((scrollTop + viewH) / ITEM_H) + BUFFER);

    inner.innerHTML = '';
    for (let i = start; i < end; i++) {
      const row = document.createElement('div');
      row.className = 'virtual-row';
      row.style.cssText = `position:absolute;top:${i*ITEM_H}px;left:0;right:0;height:${ITEM_H}px;`;
      row.innerHTML = `<span>${data[i].id}</span><span>${data[i].name}</span><span>${data[i].value}</span>`;
      inner.appendChild(row);
    }
  }

  container.addEventListener('scroll', render, { passive: true });
  render();
})();
```
