import { Component, computed, inject, signal } from '@angular/core';
import { AuthStore } from '../../../core/store/auth-store';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { CashRegisterStore } from '../store/cash-register-store';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFastToastComponent } from 'ng-fast-toast';

@Component({
  selector: 'app-cash-register',
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  providers: [CurrencyPipe],
  templateUrl: './cash-register.component.html',
  styleUrl: './cash-register.component.css',
})
export class CashRegisterComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  authStore = inject(AuthStore);
  cashRegisterStore = inject(CashRegisterStore);
  private currencyPipe = inject(CurrencyPipe);

  currentDate = Date.now();
  currentHour = new Date().getHours();
  currentMinute = new Date().getMinutes();
  closeConfirmationOpen = signal<boolean>(false);

  differenceStatus = computed<'ok' | 'short' | 'over'>(() => {
    const difference = this.cashRegisterStore.cashDifference();
    if (difference === 0) return 'ok';
    return difference < 0 ? 'short' : 'over';
  });
  differenceFeedback = computed(() => {
    switch (this.differenceStatus()) {
      case 'short':
        return 'Faltante detectado: revisa pagos en efectivo y gastos antes de cerrar.';
      case 'over':
        return 'Sobrante detectado: valida transferencias y registros manuales.';
      default:
        return 'Cuadre correcto: la caja coincide con el total esperado.';
    }
  });

  displayAmount = computed(() => {
    return (
      this.currencyPipe.transform(this.cashRegisterStore.amountReceived(), 'COP', '', '1.0-0') ??
      '0'
    );
  });

  displayExpectedCash = computed(
    () =>
      this.currencyPipe.transform(this.cashRegisterStore.expectedCash(), 'COP', '', '1.2-2') ??
      '0.00',
  );

  displayDifference = computed(() => {
    const diff = this.cashRegisterStore.cashDifference();
    return this.currencyPipe.transform(Math.abs(diff), 'COP', '', '1.2-2') ?? '0.00';
  });

  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.cashRegisterStore.changeAmountReceived(isNaN(value) ? 0 : value);
  }

  onAmountClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  openCashRegister() {
    this.cashRegisterStore.openCashRegister();
  }

  requestCloseCashRegister() {
    if (this.cashRegisterStore.loading()) {
      return;
    }

    this.closeConfirmationOpen.set(true);
  }

  cancelCloseCashRegister() {
    this.closeConfirmationOpen.set(false);
  }

  confirmCloseCashRegister() {
    this.closeConfirmationOpen.set(false);
    this.cashRegisterStore.closeCashRegister();
  }

  closeCashModal() {
    this.closeConfirmationOpen.set(false);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cashModal: null },
      queryParamsHandling: 'merge',
    });
  }
}
