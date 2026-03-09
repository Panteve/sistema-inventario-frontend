import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './core/components/navbar/navbar';
import { AuthStore } from './core/store/auth-store';
import { filter } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ErrorStore } from './core/store/errors-store';
import { CashRegisterComponent } from './features/cash-register/pages/cash-register.component';
import { CashRegisterStore } from './features/cash-register/store/cash-register-store';
import { FIXED_LAYOUT_THEME } from './constants/theme.constants';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CashRegisterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationStart),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.errorStore.clearError());
  }
  cashRegisterStore = inject(CashRegisterStore);
  errorStore = inject(ErrorStore);
  authStore = inject(AuthStore);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  fixedLayoutTheme = FIXED_LAYOUT_THEME;

  cashModalOpen = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('cashModal') === 'open')),
    { initialValue: false },
  );

  openCashModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cashModal: 'open' },
      queryParamsHandling: 'merge',
    });
    if (this.cashRegisterStore.cashRegisterOpen()) {
      this.cashRegisterStore.getCashRegisterSummary();
    }
  }

  closeCashModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cashModal: null },
      queryParamsHandling: 'merge',
    });
  }

  protected readonly title = signal('Sistema POS');
}
