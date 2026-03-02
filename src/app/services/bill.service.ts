import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateBillRequest } from '../interfaces/bill.interface';


@Injectable({
  providedIn: 'root',
})
export class BillService {
  private http = inject(HttpClient);

  createBill(bill: CreateBillRequest) {
    return this.http.post(`${environment.apiUrl}/bills/bill`, bill);
  }
}
