import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { BillService } from '../../services/bill.service';
import { BillResponse } from '../../../../shared/interfaces/bill.interface';
import { finalize } from 'rxjs';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-view-bill.component',
  imports: [CopPipe, RouterLink, DatePipe],
  templateUrl: './view-bill.component.html',
})
export class ViewBillComponent implements OnInit {
  billIdParams = input.required<string>({ alias: 'billId' });
  readonly from = input<string>();

  readonly breadcrumb = computed(() => {
    if (this.from() === '/view-bills/list') {
      return 'Historial de ventas';
    } else if (this.from()?.startsWith('/cash-register')) {
      return 'Historial de caja';
    } else {
      return 'Historial de ventas';
    }
  });
  loading = signal<boolean>(true);
  bill = signal<BillResponse>({
    id: 0,
    status: true,
    total: 0,
    createdAt: '',
    products: [],
    customer: null,
    cashRegister: {
      id: 0,
      officeId: 0,
    },
    employee: {
      id: 0,
      name: '',
      document: '',
      phone: '',
    },
  });

  #billService = inject(BillService);

  subtotal = computed(() =>
    this.bill().products.reduce(
      (acc, product) => acc + (product.priceTotal - product.taxAmount),
      0,
    ),
  );
  taxTotal = computed(() =>
    this.bill().products.reduce((acc, product) => acc + product.taxAmount, 0),
  );
  ngOnInit(): void {
    this.#billService
      .getBillById(Number(this.billIdParams()))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (bill) => {
          this.bill.set(bill);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
