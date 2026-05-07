import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterFullHistoryResponse } from '../../../../shared/interfaces/cash-register-interface';

@Component({
  selector: 'app-view-cash-register.component',
  imports: [],
  templateUrl: './view-cash-register.component.html',
})
export class ViewCashRegisterComponent implements OnInit {
  cashRegisterIdParams = input.required<string>({ alias: 'cashRegisterId' });
  #cashRegisterService = inject(CashRegisterService)

  cashRegisterHistory = signal<CashRegisterFullHistoryResponse>({
    id: 0,
    openedAt: '',
    initialAmount: 0,
    finalAmount: 0,
    amountReceived: 0,
    difference: 0,
    status: false,
    office: {
      name: ''
    },
    operateBy: {
      name: ''
    },
    bills: [],
    expenses: [],
    totalCashSales: 0,
    totalTransferSales: 0,
    totalSales: 0,
    totalExpenses: 0,
    topProducts: []
  })

  ngOnInit(): void {
    this.#cashRegisterService.getCashRegisterHistory(Number(this.cashRegisterIdParams())).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

}
