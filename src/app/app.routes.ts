import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BillComponent } from './pages/bill/bill.component';
import { authGuard } from './auth-guard';
import { ProductPanel } from './layout/product-panel/product-panel';
import { ProductPricesPanel } from './layout/product-prices-panel/product-prices-panel';
import { ProductStore } from './store/product-store';
import { BillStore } from './store/bill-store';
import { AgregarCliente } from './layout/add-customer/add-customer';
import { PaymentContent } from './layout/payment-content/payment-content';

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
];
