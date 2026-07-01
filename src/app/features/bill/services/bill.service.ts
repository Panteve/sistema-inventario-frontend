import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BillResponse,
  BillsHistoryListResponse,
  CreateBillRequest,
  ParamsGetBills,
} from '../../../shared/interfaces/bill.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BillService {
  #http = inject(HttpClient);

  createBill(bill: CreateBillRequest) {
    return this.#http.post<BillResponse>(`${environment.apiUrl}/bills/bill`, bill);
  }

  getBills(params: ParamsGetBills) {
    const queryParams: any = {
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      limit: params.limit,
    };

    if (params.officeId) {
      queryParams.officeId = params.officeId;
    }
    if (params.employeeId) {
      queryParams.employeeId = params.employeeId;
    }
    if (params.customerKeyword) {
      queryParams.customerKeyword = params.customerKeyword;
    }

    return this.#http.get<BillsHistoryListResponse>(`${environment.apiUrl}/bills`, {
      params: queryParams,
    });
  }

  getBillById(billId: number) {
    return this.#http.get<BillResponse>(`${environment.apiUrl}/bills/${billId}`);
  }
}
