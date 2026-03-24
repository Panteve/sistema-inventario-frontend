import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/pages/login.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { BillComponent } from './features/bill/pages/bill.component';
import { authGuard } from './core/guards/auth-guard';
import { ProductPanel } from './features/bill/layouts/product-panel/product-panel';
import { ProductPricesPanel } from './features/bill/layouts/product-prices-panel/product-prices-panel';
import { ProductStore } from './shared/store/product-store';
import { BillStore } from './features/bill/store/bill-store';
import { AgregarCliente } from './features/bill/layouts/add-customer/add-customer';
import { PaymentContent } from './features/bill/layouts/payment-content/payment-content';
import { InventoryListComponent } from './features/inventory/pages/inventory-list/inventory-list.component';
import { MovementCreateComponent } from './features/inventory/pages/movement-create/movement-create.component';
import { MovementInventoryStore } from './features/inventory/store/movement-inventory-store';
import { OfficeStore } from './shared/store/office-store';

export const routes: Routes = [
  { path: '', component: LoginComponent, title: 'Inicio de sesión' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Panel de control',
    canActivate: [authGuard],
  },
  {
    path: 'bill',
    component: BillComponent,
    title: 'Crear factura',
    canActivate: [authGuard],
    providers: [ProductStore, BillStore],
    children: [
      {
        path: 'view-products',
        title: 'Productos disponibles',
        component: ProductPanel,
        outlet: 'view-products-table',
        children: [
          {
            path: 'product-prices',
            title: 'Detalle del producto',
            outlet: 'select-product-price',
            component: ProductPricesPanel,
          },
        ],
      },
      {
        path: 'payment',
        title: 'Metodo de pago',
        component: PaymentContent,
        outlet: 'payment',
      },
      {
        path: 'add-client',
        title: 'Agregar cliente',
        outlet: 'add-client-info',
        component: AgregarCliente,
      },
    ],
  },
  {
    path: 'view-bills',
    title: 'Ver facturas',
    canActivate: [authGuard],
    children: [
      {
        path: 'bill/:billId',
        title: 'Informacion de la factura',
        outlet: 'view-bill',
        component: AgregarCliente,
      },
    ],
  },
  {
    path: 'inventory',
    title: 'Panel de control',
    canActivate: [authGuard],
    providers: [ProductStore],
    children: [
      {
        path: 'inventory-office',
        title: 'Inventario de la oficina',
        component: InventoryListComponent,
      },
      {
        path: 'new-movement',
        title: 'Nuevo movimiento',
        providers: [MovementInventoryStore, OfficeStore],
        component: MovementCreateComponent,
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada',
    redirectTo: 'dashboard',
  },
];
