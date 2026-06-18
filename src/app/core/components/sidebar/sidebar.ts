import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../../store/auth-store';

interface NavItem {
  key: string;
  label: string;
  route?: string;
  action?: 'cashModal' | 'expenseModal';
  section: string;
  requiresCashRegister?: boolean;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  authStore = inject(AuthStore);
  router = inject(Router);
  #route = inject(ActivatedRoute);

  sections = ['Menu', 'Acciones', 'Historiales', 'Gestión'];

  navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', route: '/dashboard', section: 'Menu' },
    { key: 'cash-register', label: 'Apertura de caja', action: 'cashModal', section: 'Acciones' },
    {
      key: 'create-bill',
      label: 'Generar factura',
      route: '/create-bill',
      section: 'Acciones',
      requiresCashRegister: true,
    },
    {
      key: 'create-expense',
      label: 'Crear gasto',
      action: 'expenseModal',
      section: 'Acciones',
      requiresCashRegister: true,
    },
    {
      key: 'new-movement',
      label: 'Nuevo movimiento',
      route: '/inventory/new-movement',
      section: 'Acciones',
    },
    { key: 'sales-history', label: 'Facturas', route: '/view-bills/list', section: 'Historiales' },
    { key: 'expense-history', label: 'Gastos', route: '/expense-list', section: 'Historiales' },
    {
      key: 'cash-history',
      label: 'Cajas',
      route: '/view-cash-registers/list',
      section: 'Historiales',
    },
    {
      key: 'inventory',
      label: 'Inventario',
      route: '/inventory/inventory-office',
      section: 'Historiales',
    },
    {
      key: 'movement-history',
      label: 'Movimientos',
      route: '/inventory/history-movement',
      section: 'Historiales',
    },
    {
      key: 'payment-methods',
      label: 'Metodos de pago',
      route: '/admin/payment-methods',
      section: 'Gestión',
      adminOnly: true,
    },
    {
      key: 'offices',
      label: 'Sucursales',
      route: '/admin/offices',
      section: 'Gestión',
      adminOnly: true,
    },
    {
      key: 'employees',
      label: 'Empleados',
      route: '/admin/employee-management',
      section: 'Gestión',
      adminOnly: true,
    },
    {
      key: 'products',
      label: 'Productos',
      route: '/admin/products',
      section: 'Gestión',
      adminOnly: true,
    },
  ];

  getItemsBySection(section: string): NavItem[] {
    return this.navItems.filter(
      (item) => item.section === section && (!item.adminOnly || this.authStore.isAdmin()),
    );
  }

  isActive(item: NavItem): boolean {
    if (!item.route) return false;
    return this.router.url.startsWith(item.route);
  }

  getCashRegisterLabel(): string {
    return this.authStore.cashRegisterIsOpen() ? 'Cierre de caja' : 'Apertura de caja';
  }

  handleAction(item: NavItem) {
    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action === 'cashModal') {
      this.router.navigate([], {
        relativeTo: this.#route.root,
        queryParams: { cashModal: 'open' },
        queryParamsHandling: 'merge',
      });
    } else if (item.action === 'expenseModal') {
      this.router.navigate([], {
        relativeTo: this.#route.root,
        queryParams: { expenseModal: 'open' },
        queryParamsHandling: 'merge',
      });
    }
  }

  logout() {
    this.authStore.logout();
  }
}
