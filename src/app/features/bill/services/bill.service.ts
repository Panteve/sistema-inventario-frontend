import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BillResponse, CreateBillRequest } from '../../../shared/interfaces/bill.interface';
import { environment } from '../../../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class BillService {
  private http = inject(HttpClient);

  createBill(bill: CreateBillRequest) {
    return this.http.post(`${environment.apiUrl}/bills/bill`, bill);
  }

  getBillById(billId: number) {
    return this.http.get<BillResponse>(`${environment.apiUrl}/bills/${billId}`);
  }

}
