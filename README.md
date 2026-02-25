# Sistema Inventario — Frontend (POS)

Aplicación de escritorio para punto de venta (POS) construida con **Angular** y **Electron**. Permite gestionar productos, crear facturas y administrar empleados con distintos niveles de acceso.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Módulos principales](#módulos-principales)
- [Roles del sistema](#roles-del-sistema)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)

---

## Descripción general

Este proyecto es el frontend de un sistema de inventario y punto de venta. Se distribuye como una **aplicación de escritorio multiplataforma** gracias a Electron, consumiendo una API REST externa para todas las operaciones de datos.

Flujo general del sistema:

1. El empleado inicia sesión con su documento y contraseña.
2. Según su rol (`ADMIN` o `CAJERO`), accede a las secciones habilitadas.
3. Desde el módulo de facturación puede buscar productos, agregarlos a una orden y registrar el pago.
4. El administrador tiene acceso al panel de control con métricas y gestión de usuarios.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework frontend | [Angular 21](https://angular.dev) |
| Aplicación de escritorio | [Electron 40](https://www.electronjs.org) |
| Lenguaje | TypeScript 5.9 |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com) |
| Tablas | [TanStack Table 8](https://tanstack.com/table) |
| Tests unitarios | [Vitest](https://vitest.dev) |
| Gestor de paquetes | npm 11 |

---

## Arquitectura

```
sistema-inventario-frontend/
├── electron/               # Proceso principal de Electron (main + preload)
├── src/
│   ├── app/
│   │   ├── interfaces/     # Tipos e interfaces TypeScript compartidos
│   │   ├── layout/         # Componentes de estructura (navbar, paneles)
│   │   ├── pages/          # Vistas principales (login, dashboard, bill)
│   │   ├── services/       # Servicios HTTP y lógica de negocio
│   │   ├── app.routes.ts   # Definición de rutas
│   │   └── auth-guard.ts   # Guard de autenticación
│   └── environments/       # Configuración por ambiente (dev / prod)
└── public/                 # Recursos estáticos
```

La comunicación entre Angular (renderer) y Electron (main process) se realiza a través del **preload script** (`electron/preload.js`), que expone `window.electronAPI` para operaciones seguras como el manejo de tokens de sesión.

---

## Módulos principales

### Páginas (`src/app/pages`)

| Ruta | Componente | Descripción | Auth requerida |
|---|---|---|---|
| `/` | `LoginComponent` | Inicio de sesión con documento y contraseña | No |
| `/dashboard` | `DashboardComponent` | Panel de control general | Sí |
| `/bill` | `BillComponent` | Creación y gestión de facturas | Sí |
| `/bill/products` | `ProductPanel` | Listado de productos disponibles | Sí |
| `/bill/products/product` | `ProductPricesPanel` | Detalle y precios de un producto | Sí |

### Servicios (`src/app/services`)

| Servicio | Responsabilidad |
|---|---|
| `AuthService` | Login, logout, gestión de token y rol del empleado |
| `BillService` | Creación y consulta de facturas |
| `ProductService` | Listado y búsqueda de productos |
| `PaymentMethodService` | Métodos de pago disponibles |
| `UserService` | Gestión de usuarios/empleados |
| `ThemeService` | Persistencia del tema de la interfaz (claro/oscuro) |

### Layout (`src/app/layout`)

| Componente | Descripción |
|---|---|
| `NavbarComponent` | Barra de navegación superior con accesos por rol |
| `ProductPanel` | Panel lateral de selección de productos |
| `ProductPricesPanel` | Subpanel con precios y unidades del producto |

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| `ADMIN` | Acceso completo: dashboard, facturación y gestión de empleados |
| `CAJERO` | Acceso restringido: sólo puede crear y consultar facturas |

El rol se determina automáticamente al iniciar sesión según la respuesta de la API y se almacena en `AuthService`.

---

## Requisitos previos

- **Node.js** ≥ 20
- **npm** ≥ 11
- **API backend** corriendo en `http://localhost:3000/api` (ver repositorio del backend)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Panteve/sistema-inventario-frontend.git
cd sistema-inventario-frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar la aplicación de escritorio (Angular + Electron)
npm run dev
```

Para ejecutar sólo el servidor web de desarrollo (sin Electron):

```bash
npm start
# Abrir http://localhost:4200 en el navegador
```

---

## Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| `start` | `npm start` | Inicia el servidor de desarrollo Angular en `http://localhost:4200` |
| `dev` | `npm run dev` | Inicia Angular y lanza Electron cuando el servidor esté listo |
| `build` | `npm run build` | Compila la aplicación para producción en `dist/` |
| `watch` | `npm run watch` | Compila en modo desarrollo con recarga automática |
| `test` | `npm test` | Ejecuta los tests unitarios con Vitest |
| `electron` | `npm run electron` | Inicia sólo el proceso Electron (requiere servidor ya corriendo) |

---

## Variables de entorno

La configuración de la URL de la API se encuentra en `src/environments/`:

| Archivo | Uso | `apiUrl` por defecto |
|---|---|---|
| `environment.development.ts` | Desarrollo local | `http://localhost:3000/api` |
| `environment.ts` | Producción | `http://localhost:3000/api` |

Para apuntar a un backend diferente, edita el valor de `apiUrl` en el archivo de entorno correspondiente antes de compilar.
