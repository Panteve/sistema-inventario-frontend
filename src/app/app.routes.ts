import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { LoginComponent } from './features/login/pages/login.component';
import { inject } from '@angular/core';
import { AuthStore } from './core/store/auth-store';

export const routes: Routes = [
  { path: '', component: LoginComponent, title: 'Inicio de sesión' },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {
          const authStore = inject(AuthStore);
          return authStore.isAdmin() ? '/dashboard/admin' : '/dashboard/cashier';
        },
      },
      {
        path: 'admin',
        title: 'Panel de control',
        loadComponent: () =>
          import('./features/dashboard/pages/admin-dashboard/admin-dashboard.component').then(
            (c) => c.AdminDashboardComponent,
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'cashier',
        title: 'Panel de control',
        loadComponent: () =>
          import('./features/dashboard/pages/cashier-dashboard/cashier-dashboard.component').then(
            (c) => c.CashierDashboardComponent,
          ),
        canActivate: [],
      },
    ],
  },
  {
    path: 'create-bill',
    loadComponent: () =>
      import('./features/bill/pages/create-bill/bill.component').then((c) => c.BillComponent),
    title: 'Crear factura',
    canActivate: [authGuard],
  },
  {
    path: 'view-bills',
    title: 'Ver facturas',
    children: [
      {
        path: 'bill/:billId',
        title: 'Informacion de la factura',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/bill/pages/view-bill/view-bill.component').then(
            (c) => c.ViewBillComponent,
          ),
      },
      {
        path: 'list',
        title: 'Historial de facturas',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/bill/pages/bill-list/bill-list.component').then(
            (c) => c.BillListComponent,
          ),
      },
    ],
  },
  {
    path: 'view-cash-registers',
    title: 'Ver registros de caja',
    children: [
      {
        path: 'cash-register/:cashRegisterId',
        title: 'Informacion del registro de caja',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/cash-register/pages/view-cash-register/view-cash-register.component').then(
            (c) => c.ViewCashRegisterComponent,
          ),
      },
      {
        path: 'list',
        title: 'Historial de registros de caja',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/cash-register/pages/cash-register-list/cash-register-list.component').then(
            (c) => c.CashRegisterListComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    title: 'Administración',
    canActivateChild: [adminGuard],
    children: [
      {
        path: 'payment-methods',
        title: 'Administración de métodos de pago',
        loadComponent: () =>
          import('./features/admin/pages/payment-method/payment-method.component').then(
            (c) => c.PaymentMethodComponent,
          ),
      },
      {
        path: 'employee-management',
        title: 'Administración de empleados',
        loadComponent: () =>
          import('./features/admin/pages/employees/employees.component').then(
            (c) => c.EmployeesComponent,
          ),
      },
      {
        path: 'products',
        title: 'Administración de productos',
        loadComponent: () =>
          import('./features/admin/pages/products/products.component').then(
            (c) => c.ProductsComponent,
          ),
      },
      {
        path: 'offices',
        title: 'Administración de sucursales',
        loadComponent: () =>
          import('./features/admin/pages/offices/office.component').then((c) => c.OfficeComponent),
      },
    ],
  },
  {
    path: 'inventory',
    title: 'Inventario',
    children: [
      {
        path: 'inventory-office',
        title: 'Inventario de la oficina',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/inventory/pages/inventory-list/inventory-list.component').then(
            (c) => c.InventoryListComponent,
          ),
      },
      {
        path: 'new-movement',
        title: 'Nuevo movimiento',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/inventory/pages/movement-create/movement-create.component').then(
            (c) => c.MovementCreateComponent,
          ),
      },
      {
        path: 'history-movement',
        title: 'Historial de movimientos',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/inventory/pages/movement-list/movement-list.component').then(
            (c) => c.MovementListComponent,
          ),
      },
    ],
  },
  {
    path: 'expense-list',
    loadComponent: () =>
      import('./features/expense/pages/expense-list/expense-list.component').then(
        (c) => c.ExpenseListComponent,
      ),
    title: 'Lista de gastos',
    canActivate: [authGuard],
  },
  {
    path: '**',
    title: 'Página no encontrada',
    redirectTo: 'dashboard',
  },
];
