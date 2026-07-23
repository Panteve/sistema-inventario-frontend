<h1 align="center">🛒 Sistema Inventario — Frontend (POS)</h1>

<p align="center">
  Aplicación de escritorio para punto de venta construida con <strong>Angular</strong> + <strong>Electron</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white" alt="Angular 21" />
  <img src="https://img.shields.io/badge/Electron-40-47848f?logo=electron&logoColor=white" alt="Electron 40" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/DaisyUI-5-5a0ef8?logo=daisyui&logoColor=white" alt="DaisyUI 5" />
  <img src="https://img.shields.io/badge/Vitest-4-6e9f18?logo=vitest&logoColor=white" alt="Vitest 4" />
</p>

<p align="center">
  <a href="https://github.com/Panteve/sistema-inventario">🔗 Repositorio del Backend (API REST)</a>
</p>

---

## 📋 Tabla de contenidos

- [📖 Descripción general](#-descripción-general)
- [🔗 Backend](#-backend)
- [⚙️ Stack tecnológico](#️-stack-tecnológico)
- [🏗️ Arquitectura](#️-arquitectura)
- [📦 Módulos principales](#-módulos-principales)
- [🖥️ Electron](#️-electron)
- [👤 Roles del sistema](#-roles-del-sistema)
- [✅ Requisitos previos](#-requisitos-previos)
- [🚀 Instalación](#-instalación)
- [🧰 Scripts disponibles](#-scripts-disponibles)
- [🌐 Variables de entorno](#-variables-de-entorno)
- [🧭 Flujo de trabajo con Pull Requests](#-flujo-de-trabajo-con-pull-requests)

---

## 📖 Descripción general

Este proyecto es el **frontend** de un sistema de inventario y punto de venta (POS). Se distribuye **exclusivamente como una aplicación de escritorio** mediante Electron — su ejecución fuera de Electron no está soportada, ya que funcionalidades críticas como el almacenamiento seguro del token de autenticación dependen del proceso nativo de Electron a través de `window.electronAPI`.

**Características principales:**

- Arquitectura modular por features (`features/`) con lazy loading de componentes
- State management con **@ngrx/signals** (store reactiva sin boilerplate)
- Routing con **hash location strategy** (compatible con `file://` en Electron)
- Detección de cambios **zoneless** (sin dependencia de Zone.js)
- Interceptores HTTP para autenticación y manejo de errores
- Tema claro/oscuro persistido en el sistema nativo

**Flujo general del sistema:**

```
👤 Empleado → 🔐 Login → 🧭 Rol asignado (ADMIN / CAJERO)
                                  │
              ┌───────────────────┴───────────────────┐
              ▼                                       ▼
      📊 Dashboard (admin)                  🧾 Facturación (cajero)
      Métricas y gestión                   Buscar productos → orden → pago
```

---

## 🔗 Backend

Este frontend consume la API REST del siguiente repositorio:

> **[Panteve/sistema-inventario](https://github.com/Panteve/sistema-inventario)** — Backend NestJS con la lógica de negocio, base de datos y autenticación JWT.

La URL de la API se configura en `src/environments/` (por defecto `http://localhost:3000/api`). Asegúrate de tener el backend corriendo antes de iniciar el frontend.

---

## ⚙️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| 🖼️ Framework frontend | [Angular 21](https://angular.dev) |
| 🖥️ Aplicación de escritorio | [Electron 40](https://www.electronjs.org) |
| 🔷 Lenguaje | TypeScript 5.9 |
| 🎨 Estilos | [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com) |
| 📊 Gráficas | [ApexCharts](https://apexcharts.com) + [ng-apexcharts](https://github.com/apexcharts/ng-apexcharts) |
| 📊 Tablas | [TanStack Table 8](https://tanstack.com/table) |
| 🗃️ State management | [@ngrx/signals](https://ngrx.io/guide/signals) |
| 📅 Calendario | [Cally](https://cally.woetal.dev) |
| 🔒 Credenciales nativas | [keytar](https://github.com/atom/node-keytar) |
| ⚙️ Store nativo | [electron-store](https://github.com/sindresorhus/electron-store) |
| 🧪 Tests unitarios | [Vitest 4](https://vitest.dev) |
| 📦 Gestor de paquetes | npm 11 |

---

## 🏗️ Arquitectura

```
sistema-inventario-frontend/
├── electron/                    # 🖥️  Proceso principal de Electron (main.js + preload.js)
├── src/
│   ├── app/
│   │   ├── core/                # 🔒 Singletones: guards, interceptors, servicios y stores críticos
│   │   │   ├── components/      #   Componentes de layout global (navbar)
│   │   │   ├── guards/          #   auth-guard, admin-guard
│   │   │   ├── interceptors/    #   auth.interceptor, error.interceptor
│   │   │   ├── service/         #   AuthService (auth centralizada)
│   │   │   ├── services/        #   ElectronApiService
│   │   │   └── store/           #   AuthStore, ThemeStore (ngrx/signals)
│   │   ├── features/            # 📄 Módulos de negocio (lazy loaded)
│   │   │   ├── admin/           #   Gestión de empleados, productos, sucursales, métodos de pago
│   │   │   ├── bill/            #   Facturación (crear, listar, ver facturas)
│   │   │   ├── cash-register/   #   Caja (abrir, cerrar, historial)
│   │   │   ├── dashboard/       #   Dashboards admin y cajero con gráficas ApexCharts
│   │   │   ├── expense/         #   Gestión de gastos
│   │   │   ├── inventory/       #   Inventario y movimientos
│   │   │   └── login/           #   Inicio de sesión
│   │   ├── shared/              # 🔄 Componentes, directivas, pipes, servicios y stores reutilizables
│   │   │   ├── components/      #   Modal, Filters, DateRangePopover, EmployeeSelect, OfficeSelect
│   │   │   ├── directives/      #   copMoneyInput (formato monetario COP)
│   │   │   ├── interfaces/      #   Tipos TypeScript compartidos
│   │   │   ├── layouts/         #   Tablas reutilizables, Toast
│   │   │   ├── pipes/           #   copPipe (formato moneda)
│   │   │   ├── services/        #   Servicios HTTP genéricos
│   │   │   ├── store/           #   Stores reutilizables
│   │   │   └── utils/           #   Utilidades (filterQuery)
│   │   ├── constants/           # 🎨 Constantes globales (theme.constants)
│   │   ├── app.routes.ts        # 🗺️  Definición de rutas
│   │   ├── app.config.ts        # ⚙️  Configuración de providers (routing, http, stores)
│   │   └── app.ts               # 🏠 Componente raíz
│   ├── environments/            # 🌐 Configuración por ambiente (dev / prod)
│   ├── types/                   # 🔷 Declaraciones de tipos globales (electron.d.ts)
│   ├── index.html
│   ├── main.ts
│   └── styles.css               # 🎨 Estilos globales + imports de Tailwind/DaisyUI
├── public/                      # 📁 Recursos estáticos (favicon, iconos)
└── docs/                        # 📝 Documentación y referencias
```

> La comunicación entre Angular (renderer) y Electron (main process) se realiza a través del **preload script** (`electron/preload.js`), que expone `window.electronAPI` para operaciones seguras como el manejo de tokens de sesión y preferencias de tema.

---

## 📦 Módulos principales

### 📄 Páginas y rutas

| Ruta | Componente | Módulo | Descripción | 🔒 Auth | 👑 Admin |
|---|---|---|---|:---:|:---:|
| `/` | `LoginComponent` | login | Inicio de sesión con documento y contraseña | ❌ | — |
| `/dashboard` | — | dashboard | Redirige根据 el rol a `/admin` o `/cashier` | ✅ | — |
| `/dashboard/admin` | `AdminDashboardComponent` | dashboard | Panel de control con métricas y gráficas | ✅ | ✅ |
| `/dashboard/cashier` | `CashierDashboardComponent` | dashboard | Panel de control del cajero | ✅ | ❌ |
| `/create-bill` | `BillComponent` | bill | Creación de facturas | ✅ | — |
| `/view-bills/list` | `BillListComponent` | bill | Historial de facturas | ✅ | — |
| `/view-bills/bill/:billId` | `ViewBillComponent` | bill | Detalle de una factura | ✅ | — |
| `/view-cash-registers/list` | `CashRegisterListComponent` | cash-register | Historial de registros de caja | ✅ | — |
| `/view-cash-registers/cash-register/:id` | `ViewCashRegisterComponent` | cash-register | Detalle de un registro de caja | ✅ | — |
| `/inventory/inventory-office` | `InventoryListComponent` | inventory | Inventario de la sucursal | ✅ | — |
| `/inventory/new-movement` | `MovementCreateComponent` | inventory | Registrar nuevo movimiento | ✅ | — |
| `/inventory/history-movement` | `MovementListComponent` | inventory | Historial de movimientos | ✅ | — |
| `/expense-list` | `ExpenseListComponent` | expense | Lista de gastos | ✅ | — |
| `/admin/employee-management` | `EmployeesComponent` | admin | Gestión de empleados | ✅ | ✅ |
| `/admin/products` | `ProductsComponent` | admin | Gestión de productos | ✅ | ✅ |
| `/admin/offices` | `OfficeComponent` | admin | Gestión de sucursales | ✅ | ✅ |
| `/admin/payment-methods` | `PaymentMethodComponent` | admin | Métodos de pago | ✅ | ✅ |

### ⚙️ Servicios

| Servicio | Ubicación | Responsabilidad |
|---|---|---|
| `AuthService` | `core/service/` | 🔐 Login, logout, gestión de token y rol |
| `ElectronApiService` | `core/services/` | 🖥️ Puente a `window.electronAPI` |
| `AuthStore` | `core/store/` | 🗃️ Estado reactivo de autenticación (ngrx/signals) |
| `ThemeStore` | `core/store/` | 🎨 Tema claro/oscuro persistido en electron-store |
| `BillService` | `features/bill/services/` | 🧾 Creación y consulta de facturas |
| `CustomerService` | `features/bill/services/` | 👤 Gestión de clientes |
| `DashboardService` | `features/dashboard/services/` | 📊 Datos de métricas y gráficas |
| `CashRegisterService` | `features/cash-register/services/` | 💰 Apertura, cierre y consulta de caja |
| `CashRegisterStore` | `features/cash-register/store/` | 🗃️ Estado reactivo de caja |
| `ExpenseService` | `features/expense/service/` | 💸 CRUD de gastos |
| `ExpenseNotificationService` | `features/expense/service/` | 🔔 Notificaciones de gastos |
| `InventoryMovementService` | `features/inventory/services/` | 📦 Movimientos de inventario |
| `EmployeeService` | `shared/services/` | 👥 Gestión de empleados |
| `InventoryService` | `shared/services/` | 📦 Consulta de inventario |
| `OfficeService` | `shared/services/` | 🏢 Gestión de sucursales |
| `PaymentMethodService` | `shared/services/` | 💳 Métodos de pago |
| `ProductService` | `shared/services/` | 📦 Listado y búsqueda de productos |
| `ToastService` | `shared/services/` | 🔔 Notificaciones toast |
| `ScrollRevealService` | `shared/services/` | ✨ Animaciones de scroll |

### 🧱 Componentes compartidos (`shared/`)

| Componente | Descripción |
|---|---|
| `ModalComponent` | Modal reutilizable |
| `FiltersComponent` | Filtros genéricos para tablas |
| `DateRangePopoverComponent` | Selector de rango de fechas |
| `EmployeeSelectComponent` | Selector de empleados |
| `OfficeSelectComponent` | Selector de sucursales |
| `TableProducts` | Tabla de productos |
| `TableCatalogProducts` | Tabla de catálogo de productos |
| `ToastComponent` | Notificaciones toast |

### 🛡️ Guards

| Guard | Descripción |
|---|---|
| `authGuard` | Protege rutas que requieren sesión activa |
| `adminGuard` | Protege rutas exclusivas del rol ADMIN |

---

## 🖥️ Electron

La carpeta `electron/` contiene el proceso principal de Electron. Existen **dos variantes** de `main.js` para cubrir los distintos entornos de ejecución:

### Archivos

| Archivo | Ubicación | Propósito |
|---|---|---|
| `main.js` | `electron/` | **Versión de desarrollo** — activa por defecto |
| `preload.js` | `electron/` | Script de preload (compartido por ambos entornos) |
| `mainProd.js` | `docs/` | **Versión de producción** — referencia para builds |

### Diferencias clave

| Característica | Desarrollo (`electron/main.js`) | Producción (`docs/mainProd.js`) |
|---|---|---|
| Carga de la app | `loadURL('http://localhost:8080')` | `loadFile()` desde `dist/` compilado |
| DevTools | Habilitados | Deshabilitados (F12 y Ctrl+Shift+I bloqueados) |
| Menú de aplicación | Visible | Oculto completamente |
| Maximización | Manual | Automática al iniciar |
| Fullscreen | — | Toggle con F11 |

> Para producir un build de distribución, se usa `npm run dist` que ejecuta `electron-builder` empaquetando la app compilada. Ver [Scripts disponibles](#-scripts-disponibles).

### `preload.js` — API expuesta

```typescript
window.electronAPI = {
  saveToken(token: string): Promise<void>;   // keytar — almacenamiento seguro
  getToken(): Promise<string | null>;         // keytar
  deleteToken(): Promise<void>;              // keytar
  saveTheme(theme: string): Promise<void>;   // electron-store
  getTheme(): Promise<string>;               // electron-store
};
```

---

## 👤 Roles del sistema

| Rol | Acceso |
|---|---|
| 👑 `ADMIN` | Acceso completo: dashboard admin, facturación, inventario, gastos, caja y gestión de empleados/productos/sucursales |
| 🧑‍💼 `CAJERO` | Acceso restringido: dashboard cajero, facturación, inventario y gastos |

> El rol se determina automáticamente al iniciar sesión según la respuesta de la API y se almacena en `AuthStore` (ngrx/signals).

---

## ✅ Requisitos previos

- **Node.js** ≥ 20
- **npm** ≥ 11
- **Electron** — obligatorio; la aplicación no funciona en un navegador web estándar
- **Backend corriendo** → [Panteve/sistema-inventario](https://github.com/Panteve/sistema-inventario) en `http://localhost:3000`

---

## 🚀 Instalación

### 1️⃣ Levantar el backend primero

Sigue las instrucciones del repositorio **[Panteve/sistema-inventario](https://github.com/Panteve/sistema-inventario)** para instalar y correr la API.

### 2️⃣ Instalar y ejecutar el frontend

```bash
# Clonar el repositorio
git clone https://github.com/Panteve/sistema-inventario-frontend.git
cd sistema-inventario-frontend

# Instalar dependencias
npm install

# Iniciar la aplicación de escritorio (Angular + Electron) ← forma correcta de ejecutar
npm run dev
```

> ⚠️ **Electron es obligatorio.** La aplicación depende de APIs nativas de Electron (`window.electronAPI`) para el manejo seguro de tokens de sesión. Ejecutarla solo en el navegador (`npm start`) causará errores de autenticación.

---

## 🧰 Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `npm run dev` | 🖥️ **Uso recomendado en desarrollo** — inicia Angular en `localhost:8080` y lanza Electron cuando el servidor esté listo |
| `start` | `npm start` | 🌐 Servidor Angular en `http://localhost:8080` — **no usar de forma aislada** (requiere Electron) |
| `electron` | `npm run electron` | ⚡ Inicia sólo el proceso Electron (requiere `npm start` ya corriendo) |
| `build` | `npm run build` | 📦 Compila para producción (sin Electron) |
| `build:prod` | `npm run build:prod` | 📦 Compila con configuración `production` + `electron` (base href `./`, sin hashing) |
| `watch` | `npm run watch` | 👁️ Compila en modo desarrollo con recarga automática |
| `test` | `npm test` | 🧪 Ejecuta los tests unitarios con Vitest |
| `prod` | `npm run prod` | 🏃 Build de producción + ejecuta Electron (para probar el build localmente) |
| `dist` | `npm run dist` | 📀 Build + empaca con `electron-builder` (genera instalador en `release/`) |
| `dist:win` | `npm run dist:win` | 🪟 Build + empaca con `electron-builder` para Windows (NSIS installer) |

---

## 🌐 Variables de entorno

La configuración de la URL de la API se encuentra en `src/environments/`:

| Archivo | Uso | `apiUrl` por defecto |
|---|---|---|
| `environment.development.ts` | Desarrollo local (`ng serve`) | `http://localhost:3000/api` |
| `environment.ts` | Producción (`ng build`) | `http://localhost:3000/api` |

> `angular.json` reemplaza automáticamente `environment.ts` por `environment.development.ts` al usar la configuración `development`. Para apuntar a un backend diferente, edita el valor de `apiUrl` en el archivo correspondiente.

---

## 📌 TODO — Integración con FACTUS

> Pendiente de realizar una vez el backend complete los cambios de integración con [FACTUS](https://factus.com.co/).

- [ ] **Actualizar interfaces** — revisar y modificar las interfaces TypeScript en `src/app/shared/interfaces/` (especialmente `bill.interface.ts`, `product.interface.ts`, `cash-register-interface.ts` y `expense.interface.ts`) según los nuevos modelos de datos del backend.
- [ ] **Actualizar servicios** — ajustar los servicios HTTP en `features/*/services/` y `shared/services/` para consumir los nuevos endpoints o modificar los existentes.
- [ ] **Actualizar lógica de negocio** — adaptar componentes y stores (ngrx/signals) que consuman datos afectados por el cambio (creación de facturas, cálculos de totales, movimientos de inventario, etc.).
- [ ] **Verificar tipos** — asegurar que `src/app/shared/interfaces/` y `src/types/` reflejen correctamente la respuesta de la API después del cambio.
- [ ] **Tests** — ejecutar `npm test` y actualizar tests afectados por los cambios de tipos o lógica.

---

## 🧭 Flujo de trabajo con Pull Requests

```bash
# 1️⃣ Actualizar `main`
git checkout main
git pull origin main

# 2️⃣ Crear rama de trabajo
git checkout -b feature/x

# 3️⃣ Guardar y subir cambios
git add .
git commit -m "feat: descripción corta"
git push -u origin feature/x
```

4️⃣ Crear Pull Request

Entra al repositorio y aparecerá un botón: "Compare & pull request"

```bash
# 5️⃣ Limpiar ramas después del merge
git checkout main
git pull origin main
git branch -d feature/x
git push origin --delete feature/x
```
