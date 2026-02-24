import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { BillInterface } from '../interfaces/bill.interface';
import { ProductOnBillInterface } from '../interfaces/product-on-bill.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BillService {
  private http = inject(HttpClient);

  billId = signal<number>(0);
  error = signal<string>('');

  productsOnBill = signal<ProductOnBillInterface[]>([]);
  subtotal = computed(() => {
    return this.productsOnBill().reduce((acc, product) => {
      return acc + (product?.price ?? 0) * product.quantity;
    }, 0);
  });
  iva = computed(() => {
    return this.subtotal() * 0.19;
  });
  total = computed(() => {
    return this.subtotal() + this.iva();
  });

  createBill(bill: BillInterface) {
    if (this.productsOnBill().length === 0) {
      return new Observable((observer) => {
        observer.error({
          status: 400,
          message: 'La factura debe tener al menos un producto',
          id: 1,
        });
      });
    }
    if (bill.paymentMethodId === 0) {
      return new Observable((observer) => {
        observer.error({ status: 400, message: 'Debe seleccionar un método de pago', id: 2 });
      });
    }

    const productsOnBill = this.productsOnBill().map(({ name, ...p }) => p);
    return this.http.post(`${environment.apiUrl}/bills/bill`, {
      ...bill,
      products: productsOnBill,
    });
  }
}
