import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BillComponent } from './pages/bill/bill.component';
import { authGuard } from './auth-guard';
import { ProductPanel } from './layout/product-panel/product-panel';
import { ProductPricesPanel } from './layout/product-prices-panel/product-prices-panel';
import { ProductStore } from './store/product-store';
import { BillStore } from './store/bill-store';

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
        path: 'products',
        title: 'Productos disponibles',
        component: ProductPanel,
        children: [
          {
            path: 'product',
            title: 'Detalle del producto',
            component: ProductPricesPanel,
          },
        ],
      },
    ],
  },
];
