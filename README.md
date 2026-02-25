# Sistema Inventario — Frontend (POS)

Aplicación de punto de venta (POS) de escritorio construida con **Angular 21** y **Electron 40**. Se comunica con un backend REST para gestionar productos, facturas y empleados, y empaqueta la interfaz web como una aplicación nativa de escritorio multiplataforma.

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Módulos principales](#módulos-principales)
4. [Roles del sistema](#roles-del-sistema)
5. [Requisitos previos](#requisitos-previos)
6. [Instalación](#instalación)
7. [Configuración del entorno](#configuración-del-entorno)
8. [Scripts disponibles](#scripts-disponibles)
9. [Estructura del proyecto](#estructura-del-proyecto)

---

## Descripción general

El sistema permite a los empleados (cajeros y administradores) iniciar sesión, consultar el catálogo de productos y generar facturas de venta. La autenticación se realiza contra un API backend y el token de sesión se almacena de forma segura mediante el módulo nativo de Electron.

---

## Arquitectura

```
┌─────────────────────────────────┐
│         Electron (main.js)      │  Ventana nativa del SO
│  ┌──────────────────────────┐   │
│  │   Angular (renderer)     │   │  Lógica de UI, rutas, servicios
│  │   http://localhost:4200  │   │
│  └──────────────┬───────────┘   │
└─────────────────│───────────────┘
                  │ HTTP/REST
         ┌────────▼────────┐
         │  Backend API    │  http://localhost:3000/api
         └─────────────────┘
```

- **Electron** actúa como shell nativo y gestiona el token de autenticación con `keytar`.
- **Angular** maneja la interfaz, las rutas protegidas y las llamadas al API a través de `HttpClient`.
- El **Backend REST** (proyecto separado) expone los endpoints de autenticación, productos, facturas y métodos de pago.

---

## Módulos principales

| Módulo / Servicio | Ruta | Responsabilidad |
|---|---|---|
| **Login** | `/` | Formulario de autenticación; obtiene y almacena el JWT. |
| **Dashboard** | `/dashboard` | Panel de control (solo usuarios autenticados). |
| **Bill (Factura)** | `/bill` | Creación de facturas de venta. |
| **ProductPanel** | `/bill/products` | Listado de productos disponibles para agregar a la factura. |
| **ProductPricesPanel** | `/bill/products/product` | Detalle de precios de un producto seleccionado. |
| **AuthService** | — | Login, logout, gestión de sesión y roles. |
| **BillService** | — | Creación y consulta de facturas. |
| **ProductService** | — | Listado y búsqueda de productos. |
| **PaymentMethodService** | — | Consulta de métodos de pago disponibles. |
| **UserService** | — | Gestión de datos de empleados. |
| **ThemeService** | — | Cambio de tema visual (claro / oscuro). |

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| **Admin** | Acceso completo: gestión de productos, usuarios, reportes y facturación. |
| **Cajero** | Acceso limitado a la generación de facturas y consulta de productos. |

El rol se determina en el momento del login a partir de la respuesta del API y se propaga a través de `AuthService.getIsAdmin()`.

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20 LTS o superior |
| npm | 11 o superior |
| Angular CLI | 21 |
| Electron | Se instala como dependencia del proyecto |
| Backend API | Ejecutándose en `http://localhost:3000` |

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Panteve/sistema-inventario-frontend.git
cd sistema-inventario-frontend

# 2. Instalar dependencias
npm install

# 3. Asegurarse de que el backend esté corriendo en http://localhost:3000
```

---

## Configuración del entorno

Los archivos de entorno se encuentran en `src/environments/`:

| Archivo | Uso |
|---|---|
| `environment.ts` | Producción (`production: true`) |
| `environment.development.ts` | Desarrollo (`production: false`) |

Ambos apuntan por defecto a `http://localhost:3000/api`. Modifica `apiUrl` si tu backend corre en otro host o puerto.

---

## Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| **dev** | `npm run dev` | Inicia el servidor Angular y lanza Electron en paralelo. Modo de desarrollo recomendado. |
| **start** | `npm run start` | Inicia solo el servidor de desarrollo Angular (`ng serve`). |
| **build** | `npm run build` | Compila la aplicación Angular para producción (salida en `dist/`). |
| **test** | `npm run test` | Ejecuta las pruebas unitarias con [Vitest](https://vitest.dev/). |
| **electron** | `npm run electron` | Lanza Electron apuntando a la build ya compilada. |
| **watch** | `npm run watch` | Compila en modo watch para desarrollo sin Electron. |

### Flujo de desarrollo habitual

```bash
npm run dev
```

Este comando inicia `ng serve` y espera a que `http://localhost:4200` esté disponible antes de abrir la ventana de Electron.

---

## Estructura del proyecto

```
sistema-inventario-frontend/
├── electron/
│   ├── main.js          # Proceso principal de Electron
│   └── preload.js       # Puente seguro entre Electron y Angular (contextBridge)
├── src/
│   ├── app/
│   │   ├── interfaces/  # Tipos e interfaces TypeScript
│   │   ├── layout/      # Componentes de layout (navbar, paneles)
│   │   ├── pages/       # Vistas principales (login, dashboard, bill)
│   │   ├── services/    # Lógica de negocio y llamadas HTTP
│   │   ├── app.routes.ts
│   │   └── auth-guard.ts
│   ├── environments/    # Variables de entorno por modo
│   ├── resolvers/       # Resolvers de rutas Angular
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```
