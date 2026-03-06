import { Component, computed, inject, signal } from '@angular/core';
import { ErrorStore } from '../../store/errors-store';
import { AuthStore } from '../../store/auth-store';
import { CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { CashRegisterStore } from '../../store/cash-register-store';

@Component({
  selector: 'app-cash-register',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe],
  providers: [CurrencyPipe],
  templateUrl: './cash-register.component.html',
  styleUrl: './cash-register.component.css',
})
export class CashRegisterComponent {
  errorStore = inject(ErrorStore);
  authStore = inject(AuthStore);
  cashRegisterStore = inject(CashRegisterStore);
  private currencyPipe = inject(CurrencyPipe);

  currentDate = Date.now();
  currentHour = new Date().getHours();
  currentMinute = new Date().getMinutes();
  amountReceived = signal<number>(0);
  isAmountFocused = signal<boolean>(false);

  // UI-only mock values for close cash summary.
  openingCash = signal<number>(250000);
  totalTransferSales = signal<number>(30000000);
  totalCashSales = signal<number>(780000);
  totalExpenses = signal<number>(95000);

  expectedCash = computed(() => this.openingCash() + this.totalCashSales() - this.totalExpenses());
  cashDifference = computed(() => this.amountReceived() - this.expectedCash());
  differenceStatus = computed<'ok' | 'short' | 'over'>(() => {
    const diff = this.cashDifference();
    if (diff === 0) return 'ok';
    return diff < 0 ? 'short' : 'over';
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
    if (this.isAmountFocused()) {
      const val = this.amountReceived();
      return val === 0 ? '' : String(val);
    }
    return this.currencyPipe.transform(this.amountReceived(), 'COP', '', '1.2-2') ?? '0.00';
  });

  displayExpectedCash = computed(
    () => this.currencyPipe.transform(this.expectedCash(), 'COP', '', '1.2-2') ?? '0.00',
  );

  displayDifference = computed(() => {
    const diff = this.cashDifference();
    return this.currencyPipe.transform(Math.abs(diff), 'COP', '', '1.2-2') ?? '0.00';
  });

  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  onAmountFocus() {
    this.isAmountFocused.set(true);
  }

  onAmountBlur() {
    this.isAmountFocused.set(false);
  }

  openCashRegister() {
    this.cashRegisterStore.openCashRegister(this.amountReceived());
  }
}
