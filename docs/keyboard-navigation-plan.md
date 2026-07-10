# Plan: Navegación por teclado en creación de facturas

## Objetivo

Hacer que **todo el flujo de creación de facturas** que realiza un cajero sea operable **completamente desde el teclado**, sin necesidad del mouse.

---

## Stack y convenciones

| Aspecto | Decisión |
|---------|----------|
| Framework | Angular v21 |
| Reactividad | Signals (`signal`, `computed`, `effect`) |
| Eventos de teclado | `host: { '(document:keydown)': 'handler($event)' }` en decorador del componente (**NO** `@HostListener`) |
| Referencias a elementos | `viewChild<T>('ref')` como signal (**NO** `@ViewChild` decorador) |
| UI | daisyUI 5 + Tailwind CSS |
| Estado de modales | Signals existentes (`productsModalOpen`, `paymentModalOpen`, `customerPanelOpen`) |
| Navegación en tablas | @tanstack/angular-table (ya integrado) |

---

## Flujo completo del cajero

```
[Caja abierta] → [Página de factura] → [Agregar cliente?]
                                     → [Agregar productos (modal)]
                                     → [Elegir precio (modal)]
                                     → [Modificar líneas en tabla]
                                     → [Pagar (modal)]
                                     → [Factura creada → redirección]
```

---

## Mapa de atajos por pantalla

### Global (App component)

| Tecla | Acción |
|-------|--------|
| `F1` | Navegar a nueva factura (`/create-bill`) |
| `F3` ✅ | Abrir/cerrar caja (toggle modal) |
| `F4` ✅ | Abrir modal de gasto |

### Página principal — BillComponent  ✅

| Tecla | Acción | Condición |
|-------|--------|-----------|
| `F2` | Abrir modal de productos | Sin modal abierto |
| `F8` | Abrir modal de pago | Sin modal abierto + haya productos |
| `↓` | Mover highlight a siguiente fila | Sin modal abierto |
| `↑` | Mover highlight a fila anterior | Sin modal abierto |
| `Enter` | Confirmar cantidad en input | Focus en input de cantidad |
| `Delete` | Eliminar producto de fila activa | Sin modal abierto |
| `Alt+C` | Abrir drawer de cliente | Sin modal/drawer abierto |
| `Escape` | Limpiar/Cancelar factura | Sin líneas de productos |

### Modal de productos — ProductPanel / TableProducts ✅

| Tecla | Acción |
|-------|--------|
| `Al abrir` | Focus automático en input de búsqueda |
| `↓` | Navegar a siguiente fila en tabla |
| `↑` | Navegar a fila anterior en tabla |
| `Enter` | Seleccionar producto highlighteado |
| `Escape` | Cerrar modal |

### Modal de precio — ProductPricesPanel ✅

| Tecla | Acción |
|-------|--------|
| `Al abrir` | Focus en primer botón (precio unitario) |
| `↓` | Mover highlight al siguiente precio |
| `↑` | Mover highlight al precio anterior |
| `Enter` | Seleccionar precio highlighteado |
| `Escape` | Volver a modal de productos |

**Señal nueva:** `highlightedPriceIndex = signal<number>(0)`

### Modal de pago — PaymentContent ✅

| Tecla | Acción |
|-------|--------|
| `Al abrir` | Focus en select de método de pago |
| `Enter` | Confirmar pago (si `canConfirm()`) |
| `Escape` | Cerrar modal |

### Drawer de cliente — AgregarCliente

| Tecla | Acción |
|-------|--------|
| `Enter` en input de documento | Ejecutar búsqueda |
| `Escape` | Cerrar drawer |

### Modal de apertura de caja — OpenCashRegisterComponent ✅

| Tecla | Acción |
|-------|--------|
| `Al abrir` | Focus en input de monto inicial (lo maneja ModalComponent → `focusFirstElement`) |
| `Enter` en input de monto | Validar y abrir confirmación (`requestOpenCashRegister()`) |
| `Escape` | Lo maneja ModalComponent — NO duplicar |

**Confirmación interna** (modal anidado):

| Tecla | Acción |
|-------|--------|
| `Al abrir` | Focus en botón "Cancelar" |
| `Enter` en "Sí, abrir caja" | Confirmar apertura |
| `Escape` | Cerrar confirmación, volver al formulario |

> Si el usuario es ADMIN, hay un `OfficeSelect` adicional. La navegación por Tab lo cubre naturalmente.

### Modal de cierre de caja — CloseCashRegisterComponent ✅

| Tecla | Acción |
|-------|--------|
| `Al abrir` | Focus en input de efectivo físico vía `effect` + `.select()` |
| `↓` / `↑` | Navegación cíclica: monto → textarea → Cancelar → Cerrar caja |
| `Enter` en input de monto | Avanzar foco al textarea de observaciones |
| `Enter` en textarea | Avanzar foco al botón "Cerrar caja" |
| `Enter` en botón "Cerrar caja" | Abrir confirmación (`requestCloseCashRegister()`) |
| `Escape` | Lo maneja ModalComponent — NO duplicar |

**Confirmación interna** (modal anidado): ✅

| Tecla | Acción |
|-------|--------|
| `Al abrir` | Focus en "Sí, cerrar caja" vía `effect` + `afterNextRender` |
| `←` / `→` | Navegación cíclica entre Cancelar y Sí, cerrar caja |
| `Enter` en "Sí, cerrar caja" | Confirmar cierre |
| `Escape` | Cerrar confirmación, volver al formulario |

### Modal de gasto — ExpenseComponent ✅

| Tecla | Acción |
|-------|--------|
| `Al abrir` | Focus en input de monto (lo maneja ModalComponent) |
| `Enter` en input de monto | Avanzar foco al textarea de motivo |
| `Enter` en textarea de motivo | Si válido → foco en "Crear gasto"; si inválido → marca errores |
| `Enter` en botón "Crear gasto" | Enviar formulario (`onSubmit()`) |
| `Escape` | Lo maneja ModalComponent — NO duplicar |

**⚠️ Importante:** `focusFirstElement` enfoca el ✕ antes que `<ng-content>`. Solución: `[showCloseButton]="false"` cuando el contenido ya tiene botón Cancelar.

---

## Componentes y señales a agregar

### BillComponent — señales nuevas

```typescript
activeRowIndex = signal<number>(-1);
```

Indica qué fila de la tabla de productos está "highlighteada" para navegación con flechas.

### TableProducts — señales nuevas

```typescript
highlightedRowIndex = signal<number>(-1);
```

Indica qué fila de la tabla de productos disponible está seleccionada virtualmente para navegación con flechas.

### ProductPricesPanel — señales nuevas

```typescript
highlightedPriceIndex = signal<number>(0);
```

Indica qué opción de precio (0 = unitario, 1 = mayorista) está highlighteada para navegación con flechas.

### OpenCashRegisterComponent — señales nuevas

```typescript
// No requiere nuevas señales; se usan las existentes:
// amountReceived, officeId, openConfirmationOpen
// Solo se agrega host:keydown handler
```

### CloseCashRegisterComponent — señales nuevas

```typescript
// No requiere nuevas señales; se usan las existentes:
// amountReceived, observation, closeConfirmationOpen
// Solo se agrega host:keydown handler
```

### ExpenseComponent — señales nuevas

```typescript
// No requiere nuevas señales; se usa el FormGroup existente
// Solo se agrega host:keydown handler
```

---

## Archivos a modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/app/app.ts` ✅ | Agregar `host` con F1, F3, F4 (todos implementados) |
| 2 | `src/app/features/bill/pages/create-bill/bill.component.ts` ✅ | Agregar `host` con F2, F8, flechas, Delete, Escape; signal `activeRowIndex` |
| 3 | `src/app/features/bill/pages/create-bill/bill.component.html` ✅ | `(click)` + clase highlight en `<tr>` de líneas |
| 4 | `src/app/shared/layouts/table-products/table-products.ts` | Agregar `host` con flechas + Enter; signal `highlightedRowIndex` |
| 5 | `src/app/shared/layouts/table-products/table-products.html` | Clase highlight en fila activa |
| 6 | `src/app/features/bill/layouts/product-prices-panel/product-prices-panel.ts` | Agregar `host` con flechas + Enter; signal `highlightedPriceIndex`; auto-focus al abrir |
| 7 | `src/app/features/bill/layouts/product-prices-panel/product-prices-panel.html` | Clase highlight + `tabindex` en botones de precio |
| 8 | `src/app/features/bill/layouts/payment-content/payment-content.ts` | Agregar `host` con Enter; auto-focus en select |
| 9 | `src/app/features/bill/layouts/add-customer/add-customer.ts` | Agregar `host` con Enter para búsqueda |
| 10 | `src/app/features/bill/layouts/product-panel/product-panel.ts` | Auto-focus en input de búsqueda al abrir modal |
| 11 | `src/app/features/cash-register/layouts/open-cash-register/open-cash-register.component.ts` ✅ | Agregar `host` con Enter en monto, flechas (↑↓) cíclicas en formulario y confirmación, focus en confirmación |
| 12 | `src/app/features/cash-register/layouts/close-cash-register/close-cash-register.component.ts` ✅ | Navegación con flechas (↑↓↔), Enter monto→textarea, Enter textarea→Cerrar caja, focus en confirmación, scroll al fondo |
| 13 | `src/app/features/expense/pages/expense-create/expense.component.ts` ✅ | Enter monto→textarea, Enter textarea→Crear gasto (o marca errores), `showCloseButton="false"` |

---

## Consideraciones

1. **Prioridad de eventos**: Los atajos locales (dentro de modal activo) tienen prioridad sobre globales. Se implementa verificando signals de estado (`productsModalOpen()`, `paymentModalOpen()`, etc.).
2. **ModalComponent como base**: El `ModalComponent` compartido (`shared/components/modal.component/modal.component.ts`) ya proporciona:
   - **Escape** → `close.emit()` via `host: { '(document:keydown.escape)': 'handleEscape()' }`
   - **Focus trap** con Tab cíclico via `trapFocus($event)`
   - **Auto-focus** en el primer elemento focusable al abrirse (via `effect` + `requestAnimationFrame` + `focusFirstElement`)
   
   **Regla:** Los componentes renderizados DENTRO de `<app-modal>` NO deben duplicar el manejo de Escape ni auto-focus. Solo agregan su propia lógica (Enter, flechas, etc.).

3. **Componentes dentro de ModalComponent**: Según `app.html`, estos componentes están dentro de `<app-modal>` y por tanto heredan Escape + focus trap:
   - `app-cash-register` (OpenCashRegister y CloseCashRegister)
   - `app-expense`
   
   Componentes como `BillComponent` NO están dentro de `ModalComponent` y sí necesitan su propio Escape.
4. **Accesibilidad**: Se añaden `tabindex` y `role` apropiados. Se mantiene `focus-visible`.
4. **Indicadores visuales**: Tooltips con los shortcuts (`[F2]`, `[F8]`, `[↓][↑]`) en botones y tablas.
5. **Sin dependencias nuevas**: Todo se implementa con APIs nativas de Angular (host bindings, signals).
