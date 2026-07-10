import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { PaymentMethodStore } from '../../../../shared/store/payment-method-store';
import { PaymentMethodResponse } from '../../../../shared/interfaces/paymentMethod.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';

@Component({
  selector: 'app-payment-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
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


  paymentSelectRef = viewChild<ElementRef<HTMLSelectElement>>('paymentSelectRef');
  btnConfirmRef = viewChild<ElementRef<HTMLButtonElement>>('btnConfirmRef');
  inputAmountRef = viewChild<ElementRef<HTMLInputElement>>('inputAmountRef');

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

  constructor() {
    afterRenderEffect(() => {
      this.selectedMethod()
      this.inputAmountRef()?.nativeElement.focus();
    })
  }

  onPaymentMethodChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const method = this.paymentMethodStore.paymentMethodsEntityMap()[id] ?? null;
    this.selectedMethod.set(method);
    this.changeSelectedMethod.emit(method!);
    this.inputAmountRef()?.nativeElement.focus();
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

  onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    const selectEl = this.paymentSelectRef()?.nativeElement;

    if (event.key === 'Enter' && target === selectEl) {
      event.preventDefault();
      if (typeof selectEl.showPicker === 'function') {
        try {
          selectEl.showPicker();
        } catch {
          // requiere gesto de usuario reciente; si falla, no rompemos nada
        }
      }
      return;
    }

    if (event.key === 'Enter' && target === this.inputAmountRef()?.nativeElement) {
      event.preventDefault();
      this.btnConfirmRef()?.nativeElement.focus();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const elements = [
        selectEl,
        this.inputAmountRef()?.nativeElement,
        this.btnConfirmRef()?.nativeElement,
      ].filter(Boolean) as HTMLElement[];

      const currentIdx = elements.indexOf(target);
      if (currentIdx === -1) return;

      event.preventDefault(); // esto también bloquea el ciclado nativo cuando target es el select cerrado
      const nextIdx =
        event.key === 'ArrowDown'
          ? (currentIdx + 1) % elements.length
          : (currentIdx - 1 + elements.length) % elements.length;
      elements[nextIdx].focus();
    }
  }
}
