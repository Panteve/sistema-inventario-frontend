import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { BillService } from '../../services/bill.service';
import { BillResponse } from '../../../../shared/interfaces/bill.interface';
import { finalize } from 'rxjs';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

type BreadcrumbItem = { label: string; path: string | null };

@Component({
  selector: 'app-view-bill.component',
  imports: [CopPipe, RouterLink, DatePipe],
  templateUrl: './view-bill.component.html',
})
export class ViewBillComponent implements OnInit {
  #router = inject(Router);

  billIdParams = input.required<string>({ alias: 'billId' });
  readonly from = input<string>();
  readonly fromId = input<string>();

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];
    const fromRoute = this.from();

    switch (fromRoute) {
      case '/view-cash-registers/list': {
        items.push({ label: 'Historial de cajas', path: '/view-cash-registers/list' });
        const crId = this.fromId();
        if (crId) {
          items.push({
            label: `Caja #${crId}`,
            path: `/view-cash-registers/cash-register/${crId}`,
          });
        }
        break;
      }
      case '/view-bills/list': {
        items.push({ label: 'Historial de ventas', path: '/view-bills/list' });
        break;
      }
      case '/dashboard': {
        items.push({ label: 'Dashboard', path: '/dashboard' });
        break;
      }
      default: {
        items.push({ label: 'Historial de ventas', path: '/view-bills/list' });
        break;
      }
    }

    items.push({ label: `Factura #${this.bill().id || this.billIdParams()}`, path: null });
    return items;
  });
  loading = signal<boolean>(true);
  bill = signal<BillResponse>({
    id: 0,
    status: true,
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    amountReceived: 0,
    difference: 0,
    createdAt: '',
    products: [],
    customer: null,
    cashRegister: {
      id: 0,
      office: {
        name: '',
      },
    },
    employee: {
      id: 0,
      name: '',
      document: '',
      phone: '',
    },
    payments: [],
  });

  #billService = inject(BillService);

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
  viewCashRegister(cashRegisterId: number) {
    this.#router.navigate(['/view-cash-registers/cash-register', cashRegisterId], {
      queryParams: { from: '/view-bills/bill', fromId: this.billIdParams() },
    });
  }
}
