import { Component, inject, input, OnInit } from '@angular/core';
import { CashRegisterService } from '../../services/cash-register.service';

@Component({
  selector: 'app-view-cash-register.component',
  imports: [],
  templateUrl: './view-cash-register.component.html',
})
export class ViewCashRegisterComponent implements OnInit {
  cashRegisterIdParams = input.required<string>({ alias: 'cashRegisterId' });
  #cashRegisterService = inject(CashRegisterService)
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
