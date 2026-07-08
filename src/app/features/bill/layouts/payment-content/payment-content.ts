import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { PaymentMethodStore } from '../../../../shared/store/payment-method-store';
import { PaymentMethodResponse } from '../../../../shared/interfaces/paymentMethod.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';

@Component({
  selector: 'app-payment-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CopPipe, CopMoneyInputDirective],
  providers: [],
  templateUrl: './payment-content.html',
  styleUrl: './payment-content.css',
})
export class PaymentContent {
  paymentMethodStore = inject(PaymentMethodStore);
  
  paymentMethods = this.paymentMethodStore.paymentMethods;
  selectedMethod = signal<PaymentMethodResponse | null>(null);
  amountReceived = signal<number>(0);

  total = input<number>(0);
  subtotal = input<number>(0);
  iva19 = input<number>(0);
  iva5 = input<number>(0);
  loading = input<boolean>(false);

  changeAmountReceived = output<number>();
  changeSelectedMethod = output<PaymentMethodResponse>();
  createBill = output<void>();

  affectsCash = computed(() => this.selectedMethod()?.affectsCash ?? false);
  change = computed(() => this.amountReceived() - this.total());

  canConfirm = computed(() => {
    if (!this.selectedMethod()) return false;
    if (this.affectsCash() && this.change() < 0) return false;
    return true;
  });

  onPaymentMethodChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const method = this.paymentMethodStore.paymentMethodsEntityMap()[id] ?? null;
    this.selectedMethod.set(method);
    this.changeSelectedMethod.emit(method!);
  }

  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.amountReceived.set(isNaN(value) ? 0 : value);
    this.changeAmountReceived.emit(this.amountReceived());
  }

  onAmountReceivedClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  confirm() {
    this.createBill.emit();
  }
}
