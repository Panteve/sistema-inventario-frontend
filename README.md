<h1 align="center">🛒 Sistema Inventario — Frontend (POS)</h1>

<p align="center">
  Aplicación de escritorio para punto de venta construida con <strong>Angular</strong> + <strong>Electron</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white" alt="Angular 21" />
  <img src="https://img.shields.io/badge/Electron-40-47848f?logo=electron&logoColor=white" alt="Electron 40" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Vitest-test_runner-6e9f18?logo=vitest&logoColor=white" alt="Vitest" />
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
- [👤 Roles del sistema](#-roles-del-sistema)
- [✅ Requisitos previos](#-requisitos-previos)
- [🚀 Instalación](#-instalación)
- [🧰 Scripts disponibles](#-scripts-disponibles)
- [🌐 Variables de entorno](#-variables-de-entorno)

---

## 📖 Descripción general

Este proyecto es el **frontend** de un sistema de inventario y punto de venta (POS). Se distribuye como una **aplicación de escritorio multiplataforma** gracias a Electron, consumiendo una API REST externa para todas las operaciones de datos.

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
| 📊 Tablas | [TanStack Table 8](https://tanstack.com/table) |
| 🧪 Tests unitarios | [Vitest](https://vitest.dev) |
| 📦 Gestor de paquetes | npm 11 |

---

## 🏗️ Arquitectura

```
sistema-inventario-frontend/
├── electron/               # 🖥️  Proceso principal de Electron (main + preload)
├── src/
│   ├── app/
│   │   ├── interfaces/     # 🔷 Tipos e interfaces TypeScript compartidos
│   │   ├── layout/         # 🧱 Componentes de estructura (navbar, paneles)
│   │   ├── pages/          # 📄 Vistas principales (login, dashboard, bill)
│   │   ├── services/       # ⚙️  Servicios HTTP y lógica de negocio
│   │   ├── app.routes.ts   # 🗺️  Definición de rutas
│   │   └── auth-guard.ts   # 🔒 Guard de autenticación
│   └── environments/       # 🌐 Configuración por ambiente (dev / prod)
└── public/                 # 📁 Recursos estáticos
```

> La comunicación entre Angular (renderer) y Electron (main process) se realiza a través del **preload script** (`electron/preload.js`), que expone `window.electronAPI` para operaciones seguras como el manejo de tokens de sesión.

---

## 📦 Módulos principales

### 📄 Páginas (`src/app/pages`)

| Ruta | Componente | Descripción | 🔒 Auth |
|---|---|---|:---:|
| `/` | `LoginComponent` | Inicio de sesión con documento y contraseña | ❌ |
| `/dashboard` | `DashboardComponent` | Panel de control general | ✅ |
| `/bill` | `BillComponent` | Creación y gestión de facturas | ✅ |
| `/bill/products` | `ProductPanel` | Listado de productos disponibles | ✅ |
| `/bill/products/product` | `ProductPricesPanel` | Detalle y precios de un producto | ✅ |

### ⚙️ Servicios (`src/app/services`)

| Servicio | Responsabilidad |
|---|---|
| `AuthService` | 🔐 Login, logout, gestión de token y rol del empleado |
| `BillService` | 🧾 Creación y consulta de facturas |
| `ProductService` | 📦 Listado y búsqueda de productos |
| `PaymentMethodService` | 💳 Métodos de pago disponibles |
| `UserService` | 👥 Gestión de usuarios/empleados |
| `ThemeService` | 🎨 Persistencia del tema de la interfaz (claro/oscuro) |

### 🧱 Layout (`src/app/layout`)

| Componente | Descripción |
|---|---|
| `NavbarComponent` | Barra de navegación superior con accesos por rol |
| `ProductPanel` | Panel lateral de selección de productos |
| `ProductPricesPanel` | Subpanel con precios y unidades del producto |

---

## 👤 Roles del sistema

| Rol | Acceso |
|---|---|
| 👑 `ADMIN` | Acceso completo: dashboard, facturación y gestión de empleados |
| 🧑‍💼 `CAJERO` | Acceso restringido: sólo puede crear y consultar facturas |

> El rol se determina automáticamente al iniciar sesión según la respuesta de la API y se almacena en `AuthService`.

---

## ✅ Requisitos previos

- **Node.js** ≥ 20
- **npm** ≥ 11
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

# Iniciar la aplicación de escritorio (Angular + Electron)
npm run dev
```

Para ejecutar **sólo** el servidor web de desarrollo (sin Electron):

```bash
npm start
# Abrir http://localhost:4200 en el navegador
```

---

## 🧰 Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| `start` | `npm start` | 🌐 Servidor de desarrollo Angular en `http://localhost:4200` |
| `dev` | `npm run dev` | 🖥️ Inicia Angular y lanza Electron cuando el servidor esté listo |
| `build` | `npm run build` | 📦 Compila la aplicación para producción en `dist/` |
| `watch` | `npm run watch` | 👁️ Compila en modo desarrollo con recarga automática |
| `test` | `npm test` | 🧪 Ejecuta los tests unitarios con Vitest |
| `electron` | `npm run electron` | ⚡ Inicia sólo el proceso Electron (requiere servidor ya corriendo) |

---

## 🌐 Variables de entorno

La configuración de la URL de la API se encuentra en `src/environments/`:

| Archivo | Uso | `apiUrl` por defecto |
|---|---|---|
| `environment.development.ts` | Desarrollo local | `http://localhost:3000/api` |
| `environment.ts` | Producción | `http://localhost:3000/api` |

Para apuntar a un backend diferente, edita el valor de `apiUrl` en el archivo de entorno correspondiente antes de compilar.
