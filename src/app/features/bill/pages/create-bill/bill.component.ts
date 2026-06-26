import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { DatePipe } from '@angular/common';
import { InventoryStore } from '../../../../shared/store/inventory-store';
import { BillStore } from '../../store/bill-store';
import { CustomerStore } from '../../store/customer-store';
import { AuthStore } from '../../../../core/store/auth-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';

@Component({
  selector: 'app-bill.component',
  imports: [RouterOutlet, CopPipe, DatePipe, RouterLinkWithHref],
  providers: [BillStore, CustomerStore, CopPipe],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent {
  constructor() {
    effect(() => {
      document.body.style.overflow = this.panelOpen() ? 'hidden' : '';
    });
  }
  customerStore = inject(CustomerStore);
  authStore = inject(AuthStore);
  billStore = inject(BillStore);
  inventoryStore = inject(InventoryStore);
  router = inject(Router);
  cop = inject(CopPipe);

  // Signals for UI state
  productInputId = signal<number>(0);
  productPrice = signal<number>(0);
  displayPrice = computed(() => {
    if (this.modifiyingPrice()) {
      return this.cop.transform(this.productPrice());
    }
    return '';
  });
  modifiyingPrice = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  panelOpen = signal<boolean>(false);

  currentDate = Date.now();
  billId = 0;
  // UI
  selectAll(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }

  modifyingQuantity(event: Event, productId: number) {
    const quantity = (event.target as HTMLInputElement).value;
    if (quantity === '' || Number(quantity) < 1) {
      (event.target as HTMLInputElement).value = '1';
      return;
    }
    this.billStore.modifyQuantity(Number(quantity), productId);
  }

  onModifyPriceChange(event: Event, productId: number) {
    const price = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const priceValue = Number(price);
    this.productPrice.set(isNaN(priceValue) ? 0 : priceValue);
    this.billStore.modifyPrice(isNaN(priceValue) ? 0 : priceValue, productId);
  }

  finishModifyPrice() {
    this.modifiyingPrice.set(false);
    this.productInputId.set(0);
    this.productPrice.set(0);
  }
  startModifyPrice(productId: number, price: number) {
    this.modifiyingPrice.set(true);
    this.productInputId.set(productId);
    this.productPrice.set(price);
  }

  quitProduct(productId: number) {
    this.billStore.quitProduct(productId);
  }

  cancelBill() {
    this.billStore.cancelBill();
  }
}
