import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './core/components/navbar/navbar';
import { AuthStore } from './core/store/auth-store';
import { CreateCashRegisterComponent } from './features/cash-register/pages/create-cash-register/create-cash-register.component';
import { FIXED_LAYOUT_THEME } from './constants/theme.constants';
import { ExpenseComponent } from './features/expense/pages/expense-create/expense.component';
import { ToastComponent } from './shared/layouts/toast/toast.component';
import { ScrollRevealService } from './shared/services/scroll-reveal.service';
import { ModalComponent } from './shared/components/modal.component/modal.component';
import { InventoryStore } from './shared/store/inventory-store';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:mousemove)': 'onMouseMove($event)',
    '(document:keydown)': 'onKeydown($event)',
  },
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
  inventoryStore = inject(InventoryStore);
  router = inject(Router);
  #route = inject(ActivatedRoute);
  #scrollReveal = inject(ScrollRevealService);
  fixedLayoutTheme = FIXED_LAYOUT_THEME;
  cashModalOpen = signal<boolean>(false);
  expenseModalOpen = signal<boolean>(false);
  readonly #currentUrl = signal(this.router.url);

  #rafId: number | null = null;
  #lastMouseEvent: MouseEvent | null = null;

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
    return this.#currentUrl().startsWith(route);
  }

  getCashRegisterLabel(): string {
    return this.authStore.cashRegisterIsOpen() ? 'Cierre de caja' : 'Apertura de caja';
  }

  constructor() {
    this.router.events.subscribe(() => this.#currentUrl.set(this.router.url));
  }

  logout() {
    this.authStore.logout();
  }

  

  ngOnInit() {
    this.#scrollReveal.init();
  }

  onMouseMove(event: MouseEvent) {
    this.#lastMouseEvent = event;
    if (this.#rafId !== null) return;
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      const evt = this.#lastMouseEvent;
      this.#lastMouseEvent = null;
      if (!evt) return;
      const glow = document.getElementById('cursorGlow');
      if (glow) {
        glow.style.transform = `translate(${evt.clientX - 300}px, ${evt.clientY - 300}px)`;
      }
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'F4' && this.authStore.cashRegisterIsOpen()) {
      event.preventDefault();
      if (!this.expenseModalOpen() && !this.cashModalOpen()) {
        this.openExpenseModal();
      }
      return
    }
    if (event.key === 'F3' ) {
      event.preventDefault();
      if (!this.cashModalOpen() && !this.expenseModalOpen()) {
        this.openCashModal();
      }
    }

  }
}
