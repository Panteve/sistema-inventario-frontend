import { Component, computed, inject, signal } from '@angular/core';
import { BillStore } from '../../store/bill-store';
import { PaymentMethodStore } from '../../../../shared/store/payment-method-store';
import { PaymentMethodResponse } from '../../../../shared/interfaces/paymentMethod.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';

@Component({
  selector: 'app-payment-content',
  imports: [CopPipe],
  providers: [CopPipe],
  templateUrl: './payment-content.html',
  styleUrl: './payment-content.css',
})
export class PaymentContent {
  billStore = inject(BillStore);
  paymentMethodStore = inject(PaymentMethodStore);
  copPipe = inject(CopPipe);

  paymentMethods = this.paymentMethodStore.paymentMethods;

  selectedMethod = signal<PaymentMethodResponse | null>(null);
  amountReceived = signal<number>(0);

  displayAmount = computed(() => {
    return this.copPipe.transform(this.amountReceived());
  });

  affectsCash = computed(() => this.selectedMethod()?.affectsCash ?? false);
  change = computed(() => this.amountReceived() - this.billStore.total());
  canConfirm = computed(() => {
    if (this.billStore.length() === 0) return false;
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
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  onAmountReceivedClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  confirm() {
    this.billStore.createBill();
  }
}
