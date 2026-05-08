import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterFullHistoryResponse } from '../../../../shared/interfaces/cash-register-interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-cash-register.component',
  imports: [DatePipe, CopPipe],
  templateUrl: './view-cash-register.component.html',
})
export class ViewCashRegisterComponent implements OnInit {
  cashRegisterIdParams = input.required<string>({ alias: 'cashRegisterId' });
  #cashRegisterService = inject(CashRegisterService);
  #router = inject(Router);

  loading = signal(true);

  cashRegisterHistory = signal<CashRegisterFullHistoryResponse>({
    id: 0,
    openedAt: '',
    initialAmount: 0,
    finalAmount: 0,
    amountRecived: 0,
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

  ngOnInit(): void {
    this.#cashRegisterService
      .getCashRegisterHistory(Number(this.cashRegisterIdParams()))
      .subscribe({
        next: (data) => {
          console.log(data);
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
    this.#router.navigate(['/view-bills/bill', billId]);
  }

}
