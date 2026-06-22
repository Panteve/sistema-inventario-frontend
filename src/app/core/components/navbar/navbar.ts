import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeStore } from '../../store/theme-store';
import { AuthStore } from '../../store/auth-store';
import { FIXED_LAYOUT_THEME } from '../../../constants/theme.constants';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/create-bill': 'Nueva factura',
  '/view-bills/list': 'Historial de ventas',
  '/expense-list': 'Historial de gastos',
  '/view-cash-registers/list': 'Historial de cajas',
  '/inventory/inventory-office': 'Inventario',
  '/inventory/new-movement': 'Nuevo movimiento',
  '/inventory/history-movement': 'Historial de movimientos',
  '/admin/payment-methods': 'Métodos de pago',
  '/admin/offices': 'Sucursales',
  '/admin/employee-management': 'Empleados',
  '/admin/products': 'Productos',
};

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authStore = inject(AuthStore);
  theme = inject(ThemeStore);
  router = inject(Router);
  fixedLayoutTheme = FIXED_LAYOUT_THEME;

  get breadcrumbLabel(): string {
    const url = this.router.url;
    for (const [prefix, label] of Object.entries(breadcrumbMap)) {
      if (url.startsWith(prefix)) return label;
    }
    if (url.startsWith('/view-bills/bill/')) return 'Detalle de factura';
    if (url.startsWith('/view-cash-registers/cash-register/')) return 'Detalle de caja';
    return 'Dashboard';
  }

  changeTheme(event: Event) {
    this.theme.setTheme((event.target as HTMLInputElement).checked);
  }
}
