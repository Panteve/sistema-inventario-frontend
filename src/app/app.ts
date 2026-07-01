import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './core/components/navbar/navbar';
import { AuthStore } from './core/store/auth-store';
import { CreateCashRegisterComponent } from './features/cash-register/pages/create-cash-register/create-cash-register.component';
import { FIXED_LAYOUT_THEME } from './constants/theme.constants';
import { ExpenseComponent } from './features/expense/pages/expense-create/expense.component';
import { ToastComponent } from './shared/layouts/toast/toast.component';
import { ScrollRevealService } from './shared/services/scroll-reveal.service';
import { ModalComponent } from './shared/components/modal.component/modal.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Navbar,
    CreateCashRegisterComponent,
    ExpenseComponent,
    ToastComponent,
    ModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  authStore = inject(AuthStore);
  router = inject(Router);
  #route = inject(ActivatedRoute);
  #scrollReveal = inject(ScrollRevealService);
  fixedLayoutTheme = FIXED_LAYOUT_THEME;
  cashModalOpen = signal<boolean>(false);
  expenseModalOpen = signal<boolean>(false);

  openCashModal() {
    this.cashModalOpen.set(true);
  }

  closeCashModal() {
    this.cashModalOpen.set(false);
  }
  openExpenseModal() {
    if (!this.authStore.cashRegisterIsOpen()) {
      return;
    }
    this.expenseModalOpen.set(true);
  }
  closeExpenseModal() {
    if (!this.authStore.cashRegisterIsOpen()) {
      return;
    }
    this.expenseModalOpen.set(false);
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
