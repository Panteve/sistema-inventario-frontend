import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './core/components/navbar/navbar';
import { AuthStore } from './core/store/auth-store';

import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CashRegisterComponent } from './features/cash-register/pages/create-cash-regsiter/cash-register.component';
import { FIXED_LAYOUT_THEME } from './constants/theme.constants';
import { ExpenseComponent } from './features/expense/pages/expense-create/expense.component';
import { ToastComponent } from './shared/layouts/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CashRegisterComponent, ExpenseComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  authStore = inject(AuthStore);
  router = inject(Router);
  #route = inject(ActivatedRoute);
  fixedLayoutTheme = FIXED_LAYOUT_THEME;

  cashModalOpen = toSignal(
    this.#route.queryParamMap.pipe(map((params) => params.get('cashModal') === 'open')),
    { initialValue: false },
  );

  expenseModalOpen = toSignal(
    this.#route.queryParamMap.pipe(map((params) => params.get('expenseModal') === 'open')),
    { initialValue: false },
  );

  openCashModal() {
    this.router.navigate([], {
      relativeTo: this.#route,
      queryParams: { cashModal: 'open' },
      queryParamsHandling: 'merge',
    });
  }

  closeCashModal() {
    this.router.navigate([], {
      relativeTo: this.#route,
      queryParams: { cashModal: null },
      queryParamsHandling: 'merge',
    });
  }

  openExpenseModal() {
    this.router.navigate([], {
      relativeTo: this.#route,
      queryParams: { expenseModal: 'open' },
      queryParamsHandling: 'merge',
    });
  }

  closeExpenseModal() {
    this.router.navigate([], {
      relativeTo: this.#route,
      queryParams: { expenseModal: null },
      queryParamsHandling: 'merge',
    });
  }
  logout() {
    this.authStore.logout();
  }

  protected readonly title = signal('Sistema POS');
}
