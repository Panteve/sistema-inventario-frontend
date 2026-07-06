import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthStore } from '../../../../core/store/auth-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { ModalComponent } from '../../../../shared/components/modal.component/modal.component';
import { ProductPanel } from '../../layouts/product-panel/product-panel';
import { PaymentContent } from '../../layouts/payment-content/payment-content';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';
import {
  CreateBillRequest,
  ProductOnBill,
  ProductSelected,
} from '../../../../shared/interfaces/bill.interface';
import { BillService } from '../../services/bill.service';
import { PaymentMethodResponse } from '../../../../shared/interfaces/paymentMethod.interface';
import { ToastService } from '../../../../shared/services/toast.service';
import { AgregarCliente } from '../../layouts/add-customer/add-customer';
import { CreateCustomerRequest } from '../../../../shared/interfaces/customer-interface';
import { InventoryStore } from '../../../../shared/store/inventory-store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bill.component',
  imports: [
    CopPipe,
    DatePipe,
    ModalComponent,
    ProductPanel,
    PaymentContent,
    AgregarCliente,
    CopMoneyInputDirective,
  ],
  providers: [],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent {
  constructor() {
    effect(() => {
      document.body.style.overflow = this.customerPanelOpen() ? 'hidden' : '';
    });
  }

  toastService = inject(ToastService);
  billService = inject(BillService);
  inventoryStore = inject(InventoryStore);
  authStore = inject(AuthStore);
  router = inject(Router);

  customerPanelOpen = signal<boolean>(false);
  paymentModalOpen = signal<boolean>(false);
  productsModalOpen = signal<boolean>(false);
  clearCustomer = signal<boolean>(false);

  bill = signal<CreateBillRequest>({
    customerId: 0,
    paymentMethodId: 0,
    amountReceived: 0,
    products: [],
  });

  customer = signal<CreateCustomerRequest | null>(null);
  loading = signal<boolean>(false);

  subtotal = computed(
    () => this.bill().products?.reduce((acc, p) => acc + (p.priceUnique || 0) * p.quantity, 0) ?? 0,
  );
  iva19 = computed(
    () =>
      this.bill()
        .products?.filter((p) => p.taxPercentage === 19)
        .reduce((acc, p) => acc + p.taxAmount!, 0) ?? 0,
  );
  iva5 = computed(
    () =>
      this.bill()
        .products?.filter((p) => p.taxPercentage === 5)
        .reduce((acc, p) => acc + p?.taxAmount! * p.quantity, 0) ?? 0,
  );
  total = computed(() => this.subtotal() + this.iva19() + this.iva5());

  currentDate = Date.now();
  // UI
  selectAll(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }

  modifyingQuantity(event: Event, productId: number) {
    let quantity = Number((event.target as HTMLInputElement).value);
    if (quantity < 1) {
      (event.target as HTMLInputElement).value = '1';
      quantity = 1;
    }

    this.bill.update((bill) => {
      return {
        ...bill,
        products: bill.products.map((p) => {
          if (p.productId === productId) {
            const taxAmount = Math.round(p.priceUnique * quantity * (p.taxPercentage! / 100));
            return { ...p, quantity: Number(quantity), taxAmount };
          }
          return p;
        }),
      };
    });
  }

  onModifyPriceChange(event: Event, productId: number) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const price = Number(raw);
    this.bill.update((bill) => {
      return {
        ...bill,
        products: bill.products.map((p) => {
          if (price < 1) {
            return p;
          }
          if (p.productId === productId) {
            return { ...p, priceUnique: price };
          }
          return p;
        }),
      };
    });
  }

  addProduct(product: ProductSelected) {
    const productTo: ProductOnBill = {
      productId: product.id,
      name: product.name,
      priceUnique: product.priceSelected,
      taxPercentage: product.taxpercentage,
      taxAmount: product.priceSelected * (product.taxpercentage / 100),
      quantity: 1,
    };

    if (!this.bill().products.some((p) => p.productId === productTo.productId)) {
      this.bill.update((bill) => ({
        ...bill,
        products: [...bill.products, productTo],
      }));
    } else {
      this.bill.update((bill) => ({
        ...bill,
        products: bill.products.map((p) => {
          if (p.productId === productTo.productId) {
            return { ...p, quantity: p.quantity + 1 };
          }
          return p;
        }),
      }));
    }

    this.toastService.show({
      title: 'Producto agregado',
      content: `Se agregó ${productTo.name} a la factura.`,
      type: 'success',
    });
  }

  quitProduct(productId: number) {
    this.bill.update((bill) => {
      return {
        ...bill,
        products: bill.products.filter((p) => p.productId !== productId),
      };
    });
  }

  setPaymentMethod(paymentMethod: PaymentMethodResponse) {
    this.bill.update((bill) => {
      return {
        ...bill,
        paymentMethodId: paymentMethod.id,
        amountReceived: paymentMethod.affectsCash ? bill.amountReceived : this.total(),
      };
    });
  }

  setAmountReceived(amount: number) {
    this.bill.update((bill) => {
      return {
        ...bill,
        amountReceived: amount,
      };
    });
  }

  cancelBill() {
    this.clearCustomer.set(true);
    this.bill.set({
      customerId: 0,
      paymentMethodId: 0,
      amountReceived: 0,
      products: [],
    });
  }

  createBill() {
    this.loading.set(true);
    if (this.bill().products.length === 0) {
      this.loading.set(false);
      return;
    }
    const cleanProducts = this.bill().products.map(
      ({ name, taxPercentage, taxAmount, ...rest }) => rest,
    );
    const cleanBill = {
      ...this.bill(),
      products: cleanProducts,
      customerId: this.customer()?.id ?? 0,
    };
    this.billService.createBill(cleanBill).subscribe({
      next: (billResponse) => {
        this.router.navigate(['/view-bills/bill', billResponse.id], {
          state: { bill: billResponse },
        });
        this.inventoryStore.modifyProductStock(cleanProducts);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.show({
          title: 'Error al crear la factura',
          content: 'Ocurrió un error al crear la factura. Inténtalo de nuevo.',
          type: 'error',
        });
        this.loading.set(false);
      },
    });
  }

  openProductModal() {
    this.productsModalOpen.set(true);
  }
  closeProductModal() {
    this.productsModalOpen.set(false);
  }

  openPaymentModal() {
    this.paymentModalOpen.set(true);
  }
  closePaymentModal() {
    this.paymentModalOpen.set(false);
  }
}
