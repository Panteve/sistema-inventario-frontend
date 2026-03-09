import { Component, computed, inject, signal } from '@angular/core';
import { BillStore } from '../../store/bill-store';
import { ErrorStore } from '../../../../core/store/errors-store';
import { PaymentMethodStore } from '../../store/payment-method-store';
import { CurrencyPipe } from '@angular/common';
import { PaymentMethodResponse } from '../../../../shared/interfaces/paymentMethod.interface';

@Component({
  selector: 'app-payment-content',
  imports: [CurrencyPipe],
  templateUrl: './payment-content.html',
  styleUrl: './payment-content.css',
})
export class PaymentContent {
  billStore = inject(BillStore);
  errorStore = inject(ErrorStore);
  paymentMethodStore = inject(PaymentMethodStore);

  paymentMethods = this.paymentMethodStore.paymentMethods;

  selectedMethod = signal<PaymentMethodResponse | null>(null);
  amountReceived = signal<number>(0);

  affectsCash = computed(() => this.selectedMethod()?.affectsCash ?? false);
  change = computed(() => this.amountReceived() - this.billStore.total());
  canConfirm = computed(() => {
    if (!this.selectedMethod()) return false;
    if (this.affectsCash() && this.change() < 0) return false;
    return true;
  });

  onPaymentMethodChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const method = this.paymentMethods().find((m) => m.id === id) ?? null;
    this.selectedMethod.set(method);
    this.billStore.setMethodOfPayment(id);

    if (!method?.affectsCash) {
      this.amountReceived.set(0);
    }
  }

  onAmountReceivedChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  confirm() {
    this.billStore.createBill();
  }
}
