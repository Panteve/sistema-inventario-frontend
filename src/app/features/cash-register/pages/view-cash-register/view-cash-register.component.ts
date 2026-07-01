import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterFullHistoryResponse } from '../../../../shared/interfaces/cash-register-interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { Router, RouterLink } from '@angular/router';

type BreadcrumbItem = { label: string; path: string | null };

@Component({
  selector: 'app-view-cash-register.component',
  imports: [DatePipe, CopPipe, RouterLink],
  templateUrl: './view-cash-register.component.html',
})
export class ViewCashRegisterComponent implements OnInit {
  cashRegisterIdParams = input.required<string>({ alias: 'cashRegisterId' });
  readonly from = input<string>();
  readonly fromId = input<string>();
  #cashRegisterService = inject(CashRegisterService);
  #router = inject(Router);

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];
    const fromRoute = this.from();

    switch (fromRoute) {
      case '/view-cash-registers/list': {
        items.push({ label: 'Historial de cajas', path: '/view-cash-registers/list' });
        break;
      }
      case '/view-bills/bill': {
        items.push({ label: 'Historial de ventas', path: '/view-bills/list' });
        const billId = this.fromId();
        if (billId) {
          items.push({ label: `Factura #${billId}`, path: `/view-bills/bill/${billId}` });
        }
        break;
      }
      case '/dashboard': {
        items.push({ label: 'Dashboard', path: '/dashboard' });
        break;
      }
      default: {
        items.push({ label: 'Historial de cajas', path: '/view-cash-registers/list' });
        break;
      }
    }

    items.push({ label: `Caja #${this.cashRegisterIdParams()}`, path: null });
    return items;
  });

  loading = signal(true);

  cashRegisterHistory = signal<CashRegisterFullHistoryResponse>({
    id: 0,
    openedAt: '',
    initialAmount: 0,
    finalAmount: 0,
    amountReceived: 0,
    difference: 0,
    status: false,
    office: {
      name: '',
    },
    operateBy: {
      name: '',
    },
    bills: [],
    expenses: [],
    totalCashSales: 0,
    totalTransferSales: 0,
    totalSales: 0,
    totalExpenses: 0,
    topProducts: [],
  });

  #calculateDuration = computed(() => {
    const history = this.cashRegisterHistory();
    if (!history.openedAt) return { hours: 0, minutes: 0, display: '' };

    const openedDate = new Date(history.openedAt);
    const closedDate = history.closedAt ? new Date(history.closedAt) : new Date();

    const diffMs = closedDate.getTime() - openedDate.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    const display = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return { hours, minutes, display };
  });

  duration = computed(() => this.#calculateDuration().display);

  transferBreakdown = computed(() => {
    const bills = this.cashRegisterHistory().bills;
    const groups = new Map<string, { count: number; total: number }>();

    for (const bill of bills) {
      const methods = bill.payments
        .filter(p => p.paymentMethod.name.toLowerCase() !== 'efectivo')
        .map(p => p.paymentMethod.name);
      const unique = new Set(methods);
      for (const name of unique) {
        const entry = groups.get(name) ?? { count: 0, total: 0 };
        entry.count++;
        entry.total += bill.total;
        groups.set(name, entry);
      }
    }

    return Array.from(groups.entries())
      .map(([name, data]) => ({ name, count: data.count, total: data.total }))
      .sort((a, b) => b.total - a.total);
  });

  ngOnInit(): void {
    this.#cashRegisterService
      .getCashRegisterHistory(Number(this.cashRegisterIdParams()))
      .subscribe({
        next: (data) => {
          this.cashRegisterHistory.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        },
      });
  }

  openBillDetail(billId: number) {
    this.#router.navigate(['/view-bills/bill', billId], {
      queryParams: { from: '/view-cash-registers/list', fromId: this.cashRegisterIdParams() },
    });
  }
}
