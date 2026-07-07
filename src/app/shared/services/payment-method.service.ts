import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreatePaymentMethodRequest,
  PaymentMethodResponse,
} from '../interfaces/paymentMethod.interface';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../../core/store/auth-store';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  #http = inject(HttpClient);
  #authStore = inject(AuthStore);

  createPaymentMethod(payload: CreatePaymentMethodRequest) {
    return this.#http.post<PaymentMethodResponse>(
      `${environment.apiUrl}/payment-method/create`,
      payload,
    );
  }

  loadPaymentMethods() {
    return this.#http.get<PaymentMethodResponse[]>(`${environment.apiUrl}/payment-method`);
  }

  updatePaymentMethod(id: number, payload: CreatePaymentMethodRequest) {
    return this.#http.patch(`${environment.apiUrl}/payment-method/update/${id}`, payload);
  }

  setStatusPaymentMethod(id: number, status: boolean) {
    return this.#http.patch(`${environment.apiUrl}/payment-method/status/${id}`, { status });
  }
}
