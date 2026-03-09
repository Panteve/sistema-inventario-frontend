import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  CreateCustomerRequest,
  CustomerResponse,
  UpdateCustomerRequest,
} from '../../../shared/interfaces/customer-interface';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);

  searchCustomerByDoc(document: string) {
    return this.http.get<CustomerResponse>(
      `${environment.apiUrl}/customers/customer/doc/${document}`,
    );
  }
  createCustomer(customerData: CreateCustomerRequest) {
    return this.http.post<CustomerResponse>(
      `${environment.apiUrl}/customers/customer`,
      customerData,
    );
  }
  updateCustomerByDoc(document: string, customerData: UpdateCustomerRequest) {
    return this.http.patch<CustomerResponse>(
      `${environment.apiUrl}/customers/update/doc/${document}`,
      customerData,
    );
  }
  updateCustomerByID(id: number, customerData: UpdateCustomerRequest) {
    return this.http.patch<CustomerResponse>(
      `${environment.apiUrl}/customers/update/id/${id}`,
      customerData,
    );
  }
}
