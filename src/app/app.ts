import { Component, HostListener, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './core/components/navbar/navbar';
import { AuthStore } from './core/store/auth-store';

import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CreateCashRegisterComponent } from './features/cash-register/pages/create-cash-regsiter/create-cash-register.component';
import { FIXED_LAYOUT_THEME } from './constants/theme.constants';
import { ExpenseComponent } from './features/expense/pages/expense-create/expense.component';
import { ToastComponent } from './shared/layouts/toast/toast.component';
import { ScrollRevealService } from './shared/services/scroll-reveal.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CreateCashRegisterComponent, ExpenseComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  authStore = inject(AuthStore);
  router = inject(Router);
  #route = inject(ActivatedRoute);
  #scrollReveal = inject(ScrollRevealService);
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

  handleAction(route?: string, action?: 'cashModal' | 'expenseModal') {
    if (route) {
      this.router.navigate([route]);
    } else if (action === 'cashModal') {
      this.router.navigate([], {
        relativeTo: this.#route.root,
        queryParams: { cashModal: 'open' },
        queryParamsHandling: 'merge',
      });
    } else if (action === 'expenseModal') {
      this.router.navigate([], {
        relativeTo: this.#route.root,
        queryParams: { expenseModal: 'open' },
        queryParamsHandling: 'merge',
      });
    }
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  getCashRegisterLabel(): string {
    return this.authStore.cashRegisterIsOpen() ? 'Cierre de caja' : 'Apertura de caja';
  }

  logout() {
    this.authStore.logout();
  }

  protected readonly title = signal('Sistema POS');

  ngOnInit() {
    this.#scrollReveal.init();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const glow = document.getElementById('cursorGlow');
    if (glow) {
      glow.style.transform = `translate(${event.clientX - 300}px, ${event.clientY - 300}px)`;
    }
  }
}
