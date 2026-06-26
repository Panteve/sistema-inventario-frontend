import { DatePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { Employee } from '../../../../shared/interfaces/Auth.interface';
import { CashRegisterSummaryResponse } from '../../../../shared/interfaces/cash-register-interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';

@Component({
  selector: 'app-close-cash-register',
  imports: [DatePipe, CopPipe, CopMoneyInputDirective],
  templateUrl: './close-cash-register.component.html',
})
export class CloseCashRegisterComponent {
  employee = input.required<Employee | null>();
  cashRegisterSummary = input.required<CashRegisterSummaryResponse>();
  closeModal = output<void>();
  closeCashRegister = output<number>();
  loading = input.required<boolean>();
  loadingSummary = input.required<boolean>();

  currentDate = new Date();
  closeConfirmationOpen = signal<boolean>(false);
  amountReceived = signal<number>(0);

  expected = computed(() => {
    return (
      this.cashRegisterSummary().initialAmount +
      this.cashRegisterSummary().totalCashSales -
      this.cashRegisterSummary().totalExpenses
    );
  });
  cashDifference = computed(() => {
    if (this.expected() < 0) {
      return this.amountReceived() + this.expected();
    }
    return this.amountReceived() - this.expected();
  });
  differenceStatus = computed<'ok' | 'short' | 'over'>(() => {
    const difference = this.cashDifference();
    if (Math.abs(difference) <= 50) return 'ok';
    return difference < 0 ? 'short' : 'over';
  });

  emitCloseCashModal() {
    this.closeModal.emit();
  }

  requestCloseCashRegister() {
    this.closeConfirmationOpen.set(true);
  }

  cancelCloseCashRegister() {
    this.closeConfirmationOpen.set(false);
  }

  confirmCloseCashRegister() {
    this.closeCashRegister.emit(this.amountReceived());
    this.closeConfirmationOpen.set(false);
  }

  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  onAmountClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }
}
