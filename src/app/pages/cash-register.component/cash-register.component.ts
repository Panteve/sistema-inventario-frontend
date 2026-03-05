import { Component, computed, inject, signal } from '@angular/core';
import { ErrorStore } from '../../store/errors-store';
import { AuthStore } from '../../store/auth-store';
import { CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-cash-register',
  imports: [DatePipe, DecimalPipe, TitleCasePipe],
  providers: [CurrencyPipe],
  templateUrl: './cash-register.component.html',
  styleUrl: './cash-register.component.css',
})
export class CashRegisterComponent {
  errorStore = inject(ErrorStore);
  authStore = inject(AuthStore);
   private currencyPipe = inject(CurrencyPipe);

  currentDate = Date.now();
  currentHour = new Date().getHours();
  currentMinute = new Date().getMinutes();
  amountReceived = signal<number>(0);
  isAmountFocused = signal<boolean>(false);

  displayAmount = computed(() => {
    if (this.isAmountFocused()) {
      const val = this.amountReceived();
      return val === 0 ? '' : String(val);
    }
    return this.currencyPipe.transform(this.amountReceived(), 'COP', '', '1.2-2') ?? '0.00';
  });

  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  onAmountFocus() {
    console.log('Amount input focused');
    this.isAmountFocused.set(true);
  }

  onAmountBlur() {
    this.isAmountFocused.set(false);
  }

  openCashRegister() {

  }
}
