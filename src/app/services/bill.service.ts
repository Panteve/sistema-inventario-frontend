import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BillInterface } from '../interfaces/bill.interface';

@Injectable({
  providedIn: 'root',
})
export class BillService {
  private http = inject(HttpClient);

  createBill(bill: BillInterface):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiUrl}/bills/bill`, bill).subscribe({
        next: () => resolve(true),
        error: (err) => reject(err),
      });
    })
  }
}
