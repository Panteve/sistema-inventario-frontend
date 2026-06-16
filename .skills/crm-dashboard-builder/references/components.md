# CRM Components — Complete Code Patterns

## Card Component
```css
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:all .2s}
.card:hover{border-color:var(--border2);box-shadow:var(--shadow2)}
```

## KPI Card
```css
.kpi-card{padding:20px;position:relative;overflow:hidden}
.kpi-card .kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.kpi-card .kpi-icon svg{width:20px;height:20px;fill:#fff}
.kpi-card .kpi-value{font-family:var(--font-mono);font-size:28px;font-weight:700;color:var(--text);margin-bottom:4px}
.kpi-card .kpi-label{font-size:12px;color:var(--text3);font-weight:500}
.kpi-card .kpi-change{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;margin-top:8px}
.kpi-change.up{background:rgba(52,211,153,.1);color:var(--success)}
.kpi-change.down{background:rgba(248,113,113,.1);color:var(--danger)}
```

## Sidebar (full CSS)
```css
.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:var(--sidebar);background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;transition:width .3s cubic-bezier(.4,0,.2,1);overflow:hidden;flex-shrink:0;position:relative;z-index:100}
.sidebar.collapsed{width:var(--sidebar-collapsed)}
.sidebar-header{height:var(--topbar);display:flex;align-items:center;padding:0 20px;border-bottom:1px solid var(--border);gap:12px;flex-shrink:0}
.sidebar-logo{width:32px;height:32px;background:linear-gradient(135deg,var(--accent),var(--accent3));border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sidebar-brand{font-family:var(--font-heading);font-weight:700;font-size:16px;color:var(--text);white-space:nowrap;overflow:hidden;transition:opacity .3s}
.sidebar.collapsed .sidebar-brand{opacity:0;width:0}
.sidebar-toggle{position:absolute;right:-14px;top:24px;width:28px;height:28px;background:var(--surface);border:1px solid var(--border2);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:101;transition:transform .3s,background .3s}
.sidebar-toggle:hover{background:var(--accent);border-color:var(--accent)}
.sidebar.collapsed .sidebar-toggle{transform:rotate(180deg)}
.sidebar-nav{flex:1;padding:12px 8px;overflow-y:auto}
.nav-section{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:var(--text3);padding:12px 12px 6px;white-space:nowrap;overflow:hidden;transition:opacity .3s}
.sidebar.collapsed .nav-section{opacity:0}
.nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:all .2s;color:var(--text2);text-decoration:none;white-space:nowrap;overflow:hidden;margin-bottom:2px;position:relative}
.nav-item:hover{background:var(--surface2);color:var(--text)}
.nav-item.active{background:linear-gradient(135deg,rgba(129,140,248,.15),rgba(99,102,241,.1));color:var(--accent);font-weight:500}
.nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:20px;background:var(--accent);border-radius:0 3px 3px 0}
.nav-item svg{width:20px;height:20px;flex-shrink:0;fill:currentColor}
.nav-item span{transition:opacity .3s}
.sidebar.collapsed .nav-item span{opacity:0;width:0}
.sidebar.collapsed .nav-item{justify-content:center;padding:10px}
.sidebar-footer{padding:12px 8px;border-top:1px solid var(--border);flex-shrink:0}
.sidebar-user{display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;cursor:pointer;transition:background .2s;overflow:hidden}
.sidebar-user:hover{background:var(--surface2)}
.sidebar-user-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#a78bfa);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px;flex-shrink:0}
.sidebar-user-info{overflow:hidden;transition:opacity .3s}
.sidebar.collapsed .sidebar-user-info{opacity:0;width:0}
```

## Topbar
```css
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{height:var(--topbar);background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:16px;flex-shrink:0;backdrop-filter:blur(12px)}
.breadcrumb{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text3)}
.breadcrumb span{color:var(--text);font-weight:500}
.search-bar{flex:1;max-width:320px;display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;cursor:text}
.search-bar input{background:none;border:none;outline:none;color:var(--text);font-size:13px;width:100%}
.search-bar input::placeholder{color:var(--text3)}
.topbar-actions{margin-left:auto;display:flex;align-items:center;gap:8px}
.icon-btn{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;color:var(--text2);transition:all .2s}
.icon-btn:hover{background:var(--surface2);color:var(--text)}
.icon-btn svg{width:18px;height:18px;fill:currentColor}
```

## Data Table
```css
.table-wrap{overflow-x:auto}
.data-table{width:100%;border-collapse:collapse}
.data-table th{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);padding:10px 16px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
.data-table td{padding:12px 16px;border-bottom:1px solid var(--border);font-size:13px;color:var(--text)}
.data-table tr:hover td{background:var(--surface2)}
.data-table .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600}
.badge-active{background:rgba(52,211,153,.1);color:var(--success)}
.badge-pending{background:rgba(251,191,36,.1);color:var(--warning)}
.badge-closed{background:rgba(248,113,113,.1);color:var(--danger)}
```

## Kanban Board
```css
.kanban{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.kanban-col{flex:0 0 280px;background:var(--surface2);border-radius:var(--radius);padding:16px;min-height:400px}
.kanban-col-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.kanban-col-title{font-size:13px;font-weight:600;color:var(--text)}
.kanban-count{font-size:11px;background:var(--surface3);color:var(--text3);padding:2px 8px;border-radius:20px}
.kanban-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:8px;cursor:grab;transition:all .2s}
.kanban-card:hover{border-color:var(--border2);box-shadow:var(--shadow2);transform:translateY(-1px)}
.kanban-card:active{cursor:grabbing}
```

## Modal
```css
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s}
.modal-overlay.show{opacity:1;pointer-events:all}
.modal{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius2);width:90%;max-width:520px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;transform:scale(.95);transition:transform .25s}
.modal-overlay.show .modal{transform:scale(1)}
.modal-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.modal-title{font-size:16px;font-weight:600}
.modal-close{width:28px;height:28px;border-radius:6px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text3)}
.modal-close:hover{background:var(--surface2);color:var(--text)}
.modal-body{padding:24px;overflow-y:auto;flex:1}
.modal-footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:12px;font-weight:500;color:var(--text2);margin-bottom:6px}
.form-input,.form-select,.form-textarea{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;outline:none;transition:border-color .2s;font-family:var(--font)}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--accent)}
.form-textarea{resize:vertical;min-height:80px}
```

## Command Palette
```css
.cmd-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);z-index:2000;display:flex;align-items:flex-start;justify-content:center;padding-top:15vh;opacity:0;pointer-events:none;transition:opacity .2s}
.cmd-overlay.show{opacity:1;pointer-events:all}
.cmd-modal{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius2);width:90%;max-width:560px;overflow:hidden;transform:translateY(-8px);transition:transform .2s;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.cmd-overlay.show .cmd-modal{transform:translateY(0)}
.cmd-search{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border)}
.cmd-search svg{width:18px;height:18px;fill:var(--text3);flex-shrink:0}
.cmd-search input{flex:1;background:none;border:none;outline:none;color:var(--text);font-size:15px;font-family:var(--font)}
.cmd-search kbd{font-size:11px;color:var(--text3);background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:2px 6px}
.cmd-results{max-height:360px;overflow-y:auto;padding:8px}
.cmd-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:background .15s}
.cmd-item:hover,.cmd-item.selected{background:var(--surface2)}
.cmd-item svg{width:18px;height:18px;fill:var(--text3);flex-shrink:0}
.cmd-item-text{font-size:13px;color:var(--text);font-weight:500}
.cmd-item-sub{font-size:11px;color:var(--text3);margin-top:1px}
```

## Button System
```css
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .2s;font-family:var(--font)}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:var(--accent2);box-shadow:0 0 20px rgba(99,102,241,.3)}
.btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--surface2);color:var(--text)}
.btn-danger{background:rgba(248,113,113,.1);color:var(--danger);border:1px solid rgba(248,113,113,.2)}
.btn-danger:hover{background:rgba(248,113,113,.2)}
```

## Page Container
```css
.content{flex:1;overflow-y:auto;padding:24px;background:var(--bg)}
.page{display:none}
.page.active{display:block;animation:fadeUp .3s ease}
.page-header{margin-bottom:24px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.page-title{font-family:var(--font-heading);font-size:22px;font-weight:700;color:var(--text)}
.page-subtitle{font-size:13px;color:var(--text3);margin-top:2px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
@media(max-width:1200px){.grid-4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.grid-4,.grid-3,.grid-2{grid-template-columns:1fr}}
```
