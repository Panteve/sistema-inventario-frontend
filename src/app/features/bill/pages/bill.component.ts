import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ProductStore } from '../../../shared/store/product-store';
import { BillStore } from '../store/bill-store';
import { ErrorStore } from '../../../core/store/errors-store';
import { PaymentMethodStore } from '../store/payment-method-store';
import { CustomerStore } from '../store/customer-store';
import { CashRegisterStore } from '../../cash-register/store/cash-register-store';

@Component({
  selector: 'app-bill.component',
  imports: [RouterOutlet, CurrencyPipe, DatePipe, RouterLinkWithHref],
  providers: [BillStore, PaymentMethodStore, CustomerStore],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent {
  constructor() {
    effect(() => {
      document.body.style.overflow = this.panelOpen() ? 'hidden' : '';
    });
  }

  errorStore = inject(ErrorStore);
  customerStore = inject(CustomerStore);
  cashRegisterStore = inject(CashRegisterStore);
  billStore = inject(BillStore);
  productStore = inject(ProductStore);
  private paymentMethodStore = inject(PaymentMethodStore);
  router = inject(Router);

  paymentMethods = this.paymentMethodStore.paymentMethods;

  // Signals for UI state
  productInputId = signal<number>(0);
  modifiyingPrice = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  panelOpen = signal<boolean>(false);

  currentDate = Date.now();

  // UI
  selectAll(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  modifyingQuantity(event: Event, productId: number) {
    const quantity = (event.target as HTMLInputElement).value;
    if (quantity === '' || Number(quantity) < 1) {
      (event.target as HTMLInputElement).value = '1';
      return;
    }
    this.billStore.modifyQuantity(Number(quantity), productId);
  }

  finishModifyPrice(event: Event, productId: number) {
    const price = (event.target as HTMLInputElement).value;
    this.billStore.modifyPrice(Number(price), productId);
    this.modifiyingPrice.set(false);
  }
  quitProduct(productId: number) {
    this.billStore.quitProduct(productId);
  }

  createBill() {
    this.billStore.createBill();
  }

  cancelBill() {
    this.billStore.cancelBill();
    this.router.navigate(['/bill']);
  }
}
