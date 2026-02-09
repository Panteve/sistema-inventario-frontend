import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BillComponent } from './pages/bill/bill.component';
import { authGuard } from './auth-guard';
import { ProductPanel } from './layout/product-panel/product-panel';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Inicio de sesión' },
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
    children: [
      {
        path: 'products',
        title: 'Productos disponibles',
        component: ProductPanel,
      },
    ],
  },
];
