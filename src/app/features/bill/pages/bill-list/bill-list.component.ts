import { Component, inject, OnInit, signal } from '@angular/core';
import { BillService } from '../../services/bill.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { BillsHistoryResponse, ParamsGetBills } from '../../../../shared/interfaces/bill.interface';

@Component({
  selector: 'app-bill-list.component',
  imports: [],
  templateUrl: './bill-list.component.html',
})
export class BillListComponent implements OnInit {
  billService = inject(BillService);
  toastService = inject(ToastService);

  bills = signal<BillsHistoryResponse[]>([]);
  queryParams = signal<ParamsGetBills>({
    startDate: this.toIsoDate(this.subtractMonths(this.today, this.maxRangeMonths)),
    endDate: this.toIsoDate(this.today),
    type: undefined as 'IN' | 'OUT' | 'TRANSFER' | undefined,
    fromOfficeId: undefined as number | undefined,
    toOfficeId: undefined as number | undefined,
    employeeId: undefined as number | undefined,
    limit: this.defaultItemsPerPage,
    page: 1,
  });
  ngOnInit() {
    this.billService.getBills().subscribe({
      next: (bills) => {
        this.bills.set(bills);
      },
      error: () => {
        this.toastService.show({
          title: 'Error',
          content: 'Error al obtener las facturas',
          type: 'error',
        });
      },
    });
  }
}
