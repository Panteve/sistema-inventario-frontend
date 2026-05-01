import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreatePaymentMethodRequest,
  PaymentMethodResponse,
} from '../interfaces/paymentMethod.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  private http = inject(HttpClient);

  createPaymentMethod(payload: CreatePaymentMethodRequest) {
    return this.http.post<PaymentMethodResponse>(
      `${environment.apiUrl}/payment-method/create`,
      payload,
    );
  }

  loadPaymentMethods(showDeleted: boolean) {
    let queryParams = {};
    if (showDeleted) {
      queryParams = { showDeleted: true };
    }
    return this.http.get<PaymentMethodResponse[]>(`${environment.apiUrl}/payment-method`, {
      params: queryParams,
    });
  }

  updatePaymentMethod(id: number, payload: CreatePaymentMethodRequest) {
    return this.http.patch(`${environment.apiUrl}/payment-method/update/${id}`, payload);
  }

  setStatusPaymentMethod(id: number, status: boolean) {
    return this.http.patch(`${environment.apiUrl}/payment-method/status/${id}`, { status });
  }
}
