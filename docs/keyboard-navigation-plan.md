# Plan: Navegación por teclado en creación de facturas

## Objetivo

Hacer que **todo el flujo de creación de facturas** que realiza un cajero sea operable **completamente desde el teclado**, sin necesidad del mouse.

**Estado: ✅ COMPLETADO**

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

### Global (App component) ✅

| Tecla | Acción | Estado |
|-------|--------|--------|
| `F1` | Navegar a nueva factura (`/create-bill`) | ✅ Implementado |
| `F3` | Abrir/cerrar caja (toggle modal) | ✅ Implementado |
| `F4` | Abrir modal de gasto | ✅ Implementado |

### Página principal — BillComponent ✅

| Tecla | Acción | Condición | Estado |
|-------|--------|-----------|--------|
| `F2` | Abrir modal de productos | Sin modal abierto | ✅ Implementado |
| `F8` | Abrir modal de pago | Sin modal abierto + haya productos | ✅ Implementado |
| `↓` | Mover highlight a siguiente fila | Sin modal abierto | ✅ Implementado |
| `↑` | Mover highlight a fila anterior | Sin modal abierto | ✅ Implementado |
| `Enter` | Confirmar cantidad en input | Focus en input de cantidad | ✅ Implementado |
| `Delete` | Eliminar producto de fila activa | Sin modal abierto | ✅ Implementado |
| `Alt+C` | Abrir drawer de cliente | Sin modal/drawer abierto | ✅ Implementado |
| `Escape` | Limpiar/Cancelar factura | Sin líneas de productos | ✅ Implementado |

### Modal de productos — ProductPanel / TableProducts ✅

| Tecla | Acción | Estado |
|-------|--------|--------|
| `Al abrir` | Focus automático en input de búsqueda | ✅ Implementado |
| `↓` | Navegar a siguiente fila en tabla | ✅ Implementado |
| `↑` | Navegar a fila anterior en tabla | ✅ Implementado |
| `Enter` | Seleccionar producto highlighteado | ✅ Implementado |
| `Escape` | Cerrar modal | ✅ Implementado (via ModalComponent) |

### Modal de precio — ProductPricesPanel ✅

| Tecla | Acción | Estado |
|-------|--------|--------|
| `Al abrir` | Focus en primer botón (precio unitario) | ✅ Implementado (via `data-autofocus`) |
| `↓` | Mover highlight al siguiente precio | ✅ Implementado |
| `↑` | Mover highlight al precio anterior | ✅ Implementado |
| `Enter` | Seleccionar precio highlighteado | ✅ Implementado |
| `Escape` | Volver a modal de productos | ✅ Implementado (via ModalComponent) |

**Señal:** `highlightedPriceIndex = signal<number>(0)` ✅

### Modal de pago — PaymentContent ✅

| Tecla | Acción | Estado |
|-------|--------|--------|
| `Al abrir` | Focus en select de método de pago | ✅ Implementado |
| `↑` / `↓` | Navegación cíclica: select → monto → confirmar | ✅ Implementado |
| `Enter` | Confirmar pago (si `canConfirm()`) | ✅ Implementado |
| `Escape` | Cerrar modal | ✅ Implementado (via ModalComponent) |

### Drawer de cliente — AgregarCliente ✅

| Tecla | Acción | Estado |
|-------|--------|--------|
| `Enter` en input de documento | Ejecutar búsqueda | ✅ Implementado |
| `Escape` | Cerrar drawer | ✅ Implementado |
| `↑` / `↓` | Navegación cíclica entre elementos del formulario | ✅ Implementado |
| `Enter` en otros campos | Avanzar al siguiente elemento | ✅ Implementado |

### Modal de apertura de caja — OpenCashRegisterComponent ✅

| Tecla | Acción | Estado |
|-------|--------|--------|
| `Al abrir` | Focus en input de monto inicial | ✅ Implementado (via ModalComponent) |
| `Enter` en input de monto | Validar y abrir confirmación (`requestOpenCashRegister()`) | ✅ Implementado |
| `Escape` | Lo maneja ModalComponent — NO duplicar | ✅ Correcto |

**Confirmación interna** (modal anidado) ✅:

| Tecla | Acción | Estado |
|-------|--------|--------|
| `←` / `→` | Navegación cíclica: Cancelar ↔ Confirmar | ✅ Implementado |
| `Enter` en "Sí, abrir caja" | Confirmar apertura | ✅ Implementado |
| `Escape` | Cerrar confirmación, volver al formulario | ✅ Implementado (via ModalComponent) |

> Si el usuario es ADMIN, hay un `OfficeSelect` adicional. La navegación con `↑`/`↓` cíclica lo cubre.

### Modal de cierre de caja — CloseCashRegisterComponent ✅

| Tecla | Acción | Estado |
|-------|--------|--------|
| `Al abrir` | Focus en input de efectivo físico vía `afterRenderEffect` | ✅ Implementado |
| `↓` / `↑` | Navegación cíclica: monto → textarea → Cancelar → Cerrar caja | ✅ Implementado |
| `Enter` en input de monto | Avanzar foco al textarea de observaciones | ✅ Implementado |
| `Enter` en textarea | Avanzar foco al botón "Cerrar caja" | ✅ Implementado |
| `Enter` en botón "Cerrar caja" | Abrir confirmación (`requestCloseCashRegister()`) | ✅ Implementado |
| `Escape` | Lo maneja ModalComponent — NO duplicar | ✅ Correcto |

**Confirmación interna** (modal anidado) ✅:

| Tecla | Acción | Estado |
|-------|--------|--------|
| `←` / `→` | Navegación cíclica entre Cancelar y Sí, cerrar caja | ✅ Implementado |
| `Enter` en "Sí, cerrar caja" | Confirmar cierre | ✅ Implementado |
| `Escape` | Cerrar confirmación, volver al formulario | ✅ Implementado (via ModalComponent) |

### Modal de gasto — ExpenseComponent ✅

| Tecla | Acción | Estado |
|-------|--------|--------|
| `Al abrir` | Focus en input de monto (lo maneja ModalComponent) | ✅ Implementado |
| `Enter` en input de monto | Avanzar foco al textarea de motivo | ✅ Implementado |
| `Enter` en textarea de motivo | Si válido → foco en "Crear gasto"; si inválido → marca errores | ✅ Implementado |
| `Enter` en botón "Crear gasto" | Enviar formulario (`onSubmit()`) | ✅ Implementado |
| `Escape` | Lo maneja ModalComponent — NO duplicar | ✅ Correcto |

---

## Componentes y señales implementadas

### BillComponent — señales ✅

```typescript
activeRowIndex = signal<number>(-1);
```

✅ Implementado en `bill.component.ts:65`

### TableProducts — señales ✅

```typescript
highlightedRowIndex = signal<number>(-1);
```

✅ Implementado en `table-products.ts:70`

### ProductPricesPanel — señales ✅

```typescript
highlightedPriceIndex = signal<number>(0);
```

✅ Implementado en `product-prices-panel.ts:18`

### OpenCashRegisterComponent — señales ✅

✅ No requiere nuevas señales; se usan las existentes. Host keydown handler implementado.

### CloseCashRegisterComponent — señales ✅

✅ No requiere nuevas señales; se usan las existentes. Host keydown handler implementado.

### ExpenseComponent — señales ✅

✅ No requiere nuevas señales; se usa el FormGroup existente. Host keydown handler implementado.

---

## Archivos modificados

| # | Archivo | Cambio | Estado |
|---|---------|--------|--------|
| 1 | `src/app/app.ts` | Agregar `host` con F1, F3, F4 | ✅ Completado |
| 2 | `src/app/features/bill/pages/create-bill/bill.component.ts` | Agregar `host` con F2, F8, flechas, Delete, Escape; signal `activeRowIndex` | ✅ Completado |
| 3 | `src/app/features/bill/pages/create-bill/bill.component.html` | `(click)` + clase highlight en `<tr>` de líneas | ✅ Completado |
| 4 | `src/app/shared/layouts/table-products/table-products.ts` | Agregar `host` con flechas + Enter; signal `highlightedRowIndex` | ✅ Completado |
| 5 | `src/app/shared/layouts/table-products/table-products.html` | Clase highlight en fila activa | ✅ Completado |
| 6 | `src/app/features/bill/layouts/product-prices-panel/product-prices-panel.ts` | Agregar `host` con flechas + Enter; signal `highlightedPriceIndex`; auto-focus al abrir | ✅ Completado |
| 7 | `src/app/features/bill/layouts/product-prices-panel/product-prices-panel.html` | Clase highlight + `tabindex` en botones de precio | ✅ Completado |
| 8 | `src/app/features/bill/layouts/payment-content/payment-content.ts` | Agregar `host` con Enter; auto-focus en select | ✅ Completado |
| 9 | `src/app/features/bill/layouts/add-customer/add-customer.ts` | Agregar `host` con Enter para búsqueda | ✅ Completado |
| 10 | `src/app/features/bill/layouts/product-panel/product-panel.ts` | Auto-focus en input de búsqueda al abrir modal | ✅ Completado |
| 11 | `src/app/features/cash-register/layouts/open-cash-register/open-cash-register.component.ts` | Agregar `host` con Enter en monto, flechas (↑↓) cíclicas en formulario y confirmación, focus en confirmación | ✅ Completado |
| 12 | `src/app/features/cash-register/layouts/close-cash-register/close-cash-register.component.ts` | Navegación con flechas (↑↓↔), Enter monto→textarea, Enter textarea→Cerrar caja, focus en confirmación, scroll al fondo | ✅ Completado |
| 13 | `src/app/features/expense/pages/expense-create/expense.component.ts` | Enter monto→textarea, Enter textarea→Crear gasto (o marca errores), `showCloseButton="false"` | ✅ Completado |

---

## Consideraciones

1. **Prioridad de eventos**: Los atajos locales (dentro de modal activo) tienen prioridad sobre globales. Se implementa verificando signals de estado (`productsModalOpen()`, `paymentModalOpen()`, etc.).

2. **ModalComponent como base**: El `ModalComponent` compartido (`shared/components/modal.component/modal.component.ts`) proporciona:
   - **Escape** → `close.emit()` via `host: { '(document:keydown.escape)': 'handleEscape()' }`
   - **Focus trap** con Tab cíclico via `trapFocus($event)`
   - **Auto-focus** en el primer elemento focusable al abrirse (via `effect` + `requestAnimationFrame` + `focusFirstElement`)

3. **Componentes dentro de ModalComponent**: Estos componentes heredan Escape + focus trap:
   - `app-cash-register` (OpenCashRegister y CloseCashRegister)
   - `app-expense`

4. **Accesibilidad**: Se añaden `tabindex`, `role` y `aria-selected` apropiados. Se mantiene `focus-visible`.

5. **Indicadores visuales**: Clases de highlight (`bg-primary/10`, `ring-1`, `ring-primary/40`) en filas activas.

6. **Sin dependencias nuevas**: Todo se implementa con APIs nativas de Angular (host bindings, signals).

---

## Notas de implementación

### Patrón de navegación cíclica (reutilizado en todos los componentes)

```typescript
const elements = [this.ref1(), this.ref2(), this.ref3()];
const count = elements.length;
let idx = elements.indexOf(document.activeElement as any);

if (event.key === 'ArrowDown') {
  idx = (idx + 1) % count;
} else if (event.key === 'ArrowUp') {
  idx = (idx - 1 + count) % count;
}
elements[idx]?.nativeElement.focus();
```

### Patrón Enter entre campos (reutilizado)

```typescript
if (event.key === 'Enter') {
  const elements = [this.ref1(), this.ref2(), this.ref3()];
  const idx = elements.indexOf(document.activeElement as any);
  if (idx < elements.length - 1) {
    elements[idx + 1]?.nativeElement.focus();
  }
}
```

### Patrón Auto-focus con afterRenderEffect

```typescript
// En CloseCashRegisterComponent:
afterRenderEffect(() => {
  if (!this.loadingSummary()) {
    afterNextRender(() => {
      this.amountInputRef()?.nativeElement.focus();
    });
  }
});
```

### Mejora detectada

- Se eliminó `console.log('valido')` en `expense.component.ts` (debug artifact removido en la implementación final).
