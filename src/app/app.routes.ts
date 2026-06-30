import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/pages/login.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { BillComponent } from './features/bill/pages/create-bill/bill.component';
import { authGuard } from './core/guards/auth-guard';
import { ProductPanel } from './features/bill/layouts/product-panel/product-panel';
import { BillStore } from './features/bill/store/bill-store';
import { AgregarCliente } from './features/bill/layouts/add-customer/add-customer';
import { PaymentContent } from './features/bill/layouts/payment-content/payment-content';
import { InventoryListComponent } from './features/inventory/pages/inventory-list/inventory-list.component';
import { MovementCreateComponent } from './features/inventory/pages/movement-create/movement-create.component';
import { MovementInventoryStore } from './features/inventory/store/movement-inventory-store';
import { MovementListComponent } from './features/inventory/pages/movement-list/movement-list.component';
import { EmployeeStore } from './shared/store/employee-store';
import { ViewBillComponent } from './features/bill/pages/view-bill/view-bill.component';
import { adminChildGuard } from './core/guards/admin-child-guard';
import { ExpenseListComponent } from './features/expense/pages/expense-list/expense-list.component';
import { ViewCashRegisterComponent } from './features/cash-register/pages/view-cash-register/view-cash-register.component';
import { dashboardRedirectGuard } from './core/guards/dashboard-redirect-guard-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', component: LoginComponent, title: 'Inicio de sesión' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Panel de control',
    canActivate: [authGuard, dashboardRedirectGuard],
  },
  {
    path: 'dashboard/admin',
    providers: [EmployeeStore],
    loadComponent: () =>
      import('./features/dashboard/pages/admin-dashboard/admin-dashboard.component').then(
        (c) => c.AdminDashboardComponent,
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'dashboard/cashier',
    loadComponent: () =>
      import('./features/dashboard/pages/cashier-dashboard/cashier-dashboard.component').then(
        (c) => c.CashierDashboardComponent,
      ),
  },
  {
    path: 'create-bill',
    component: BillComponent,
    title: 'Crear factura',
    canActivate: [authGuard],
    providers: [BillStore],
    children: [
      {
        path: 'payment',
        title: 'Metodo de pago',
        canActivate: [authGuard],
        component: PaymentContent,
        outlet: 'payment',
      },
      {
        path: 'add-client',
        title: 'Agregar cliente',
        outlet: 'add-client-info',
        canActivate: [authGuard],
        component: AgregarCliente,
      },
    ],
  },
  {
    path: 'view-bills',
    title: 'Ver facturas',
    children: [
      {
        path: 'bill/:billId',
        title: 'Informacion de la factura',
        canActivate: [authGuard],
        component: ViewBillComponent,
      },
      {
        path: 'list',
        title: 'Historial de facturas',
        canActivate: [authGuard],
        providers: [EmployeeStore],
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
        title: 'Informacion de la factura',
        canActivate: [authGuard],
        component: ViewCashRegisterComponent,
      },
      {
        path: 'list',
        title: 'Historial de registros de caja',
        canActivate: [authGuard],
        providers: [EmployeeStore],
        loadComponent: () =>
          import('./features/cash-register/pages/cash-register-list/cash-register-list.component').then(
            (c) => c.CashRegisterListComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    title: 'Ver facturas',
    canActivateChild: [adminChildGuard],
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
          import('./features/admin/pages/offices/office.component').then(
            (c) => c.OfficeComponent,
          )
      },
    ],
  },
  {
    path: 'inventory',
    title: 'Panel de control',
    children: [
      {
        path: 'inventory-office',
        title: 'Inventario de la oficina',
        canActivate: [authGuard],
        component: InventoryListComponent,
      },
      {
        path: 'new-movement',
        title: 'Nuevo movimiento',
        canActivate: [authGuard],
        providers: [MovementInventoryStore],
        component: MovementCreateComponent,
      },
      {
        path: 'history-movement',
        title: 'Historial de movimientos',
        canActivate: [authGuard],
        providers: [MovementInventoryStore, EmployeeStore],
        component: MovementListComponent,
      },
    ],
  },
  {
    path: 'expense-list',
    component: ExpenseListComponent,
    providers: [EmployeeStore],
    title: 'Lista de gastos',
    canActivate: [authGuard],
  },
  {
    path: '**',
    title: 'Página no encontrada',
    redirectTo: 'dashboard',
  },
];
