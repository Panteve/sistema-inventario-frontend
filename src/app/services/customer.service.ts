import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CustomerResponse } from '../interfaces/customer-interface';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);

  searchCustomer(document: string) {
    return this.http.get<CustomerResponse>(`${environment.apiUrl}/customers/customer/doc/${document}`);
  }
}
