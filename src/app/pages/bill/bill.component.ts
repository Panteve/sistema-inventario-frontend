import { Component, inject, OnInit, signal } from '@angular/core';;
import { Router, RouterOutlet } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PaymentMethodService } from '../../services/payment-method.service';
import { ProductStore } from '../../store/product-store';
import { BillStore } from '../../store/bill-store';
import { ErrorStore } from '../../store/errors-store';

@Component({
  selector: 'app-bill.component',
  imports: [RouterOutlet, CurrencyPipe, DatePipe ],
  providers: [BillStore],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent implements OnInit {
  private paymentMethodService = inject(PaymentMethodService);
  errorStore = inject(ErrorStore);
  billStore = inject(BillStore);
  productStore = inject(ProductStore);
  router = inject(Router);

  paymentMethods = this.paymentMethodService.paymentMethods.asReadonly(); 

  // Signals for UI state
  productInputId = signal<number>(0);
  modifiyingPrice = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);

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
    this.billStore.modifyQuantity(Number(quantity), productId)
  }

  finishModifyPrice(event: Event, productId: number) {
    const price = (event.target as HTMLInputElement).value;
    this.billStore.modifyPrice(Number(price), productId)
    this.modifiyingPrice.set(false);
  }

  setPaymentMethod(id: number) {
    this.billStore.setMethodOfPayment(id);
  }

  createBill() {
    this.billStore.createBill()
  }

  cancelBill() {
    this.billStore.cancelBill();
    this.router.navigate(['/bill']);
  }

  ngOnInit(): void {
    this.paymentMethodService.loadPaymentMethods();
  }
}
