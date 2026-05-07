import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/pages/login.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { BillComponent } from './features/bill/pages/create-bill/bill.component';
import { authGuard } from './core/guards/auth-guard';
import { ProductPanel } from './features/bill/layouts/product-panel/product-panel';
import { ProductPricesPanel } from './features/bill/layouts/product-prices-panel/product-prices-panel';
import { BillStore } from './features/bill/store/bill-store';
import { AgregarCliente } from './features/bill/layouts/add-customer/add-customer';
import { PaymentContent } from './features/bill/layouts/payment-content/payment-content';
import { InventoryListComponent } from './features/inventory/pages/inventory-list/inventory-list.component';
import { MovementCreateComponent } from './features/inventory/pages/movement-create/movement-create.component';
import { MovementInventoryStore } from './features/inventory/store/movement-inventory-store';
import { MovementListComponent } from './features/inventory/pages/movement-list/movement-list.component';
import { EmployeeStore } from './shared/store/employee-store';
import { ViewBillComponent } from './features/bill/pages/view-bill/view-bill.component';
import { PaymentMethodComponent } from './features/admin/pages/payment-method/payment-method.component';
import { adminChildGuard } from './core/guards/admin-guard';
import { EmployeesComponent } from './features/admin/pages/employees/employees.component';
import { ProductsComponent } from './features/admin/pages/products/products.component';
import { BillListComponent } from './features/bill/pages/bill-list/bill-list.component';
import { ExpenseListComponent } from './features/expense/pages/expense-list/expense-list.component';
import { CashRegisterListComponent } from './features/cash-register/pages/cash-register-list/cash-register-list.component';
import { ViewCashRegisterComponent } from './features/cash-register/pages/view-cash-register.component/view-cash-register.component';


export const routes: Routes = [
  { path: '', component: LoginComponent, title: 'Inicio de sesión' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Panel de control',
    canActivate: [authGuard],
  },
  {
    path: 'create-bill',
    component: BillComponent,
    title: 'Crear factura',
    canActivate: [authGuard],
    providers: [BillStore],
    children: [
      {
        path: 'view-products',
        title: 'Productos disponibles',
        canActivate: [authGuard],
        component: ProductPanel,
        outlet: 'view-products-table',
        children: [
          {
            path: 'product-prices',
            title: 'Detalle del producto',
            outlet: 'select-product-price',
            canActivate: [authGuard],
            component: ProductPricesPanel,
          },
        ],
      },
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
        component: BillListComponent,
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
        component: ViewCashRegisterComponent
      },
      {
        path: 'list',
        title: 'Historial de registros de caja',
        canActivate: [authGuard],
        providers: [EmployeeStore],
        component: CashRegisterListComponent,
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
        title: 'Informacion de la factura',
        component: PaymentMethodComponent,
      },
      {
        path: 'employee-management',
        title: 'Administración de empleados',
        component: EmployeesComponent,
      },
      {
        path: 'products',
        title: 'Administración de productos',
        component: ProductsComponent,
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
