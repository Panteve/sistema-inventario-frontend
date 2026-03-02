import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaymentMethodResponse } from '../interfaces/paymentMethod.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  private http = inject(HttpClient);

  paymentMethods = signal<PaymentMethodResponse[]>([]);
  error = signal<string>('');

  loadPaymentMethods() {
    return this.http.get<PaymentMethodResponse[]>(`${environment.apiUrl}/payment-method`);
  }
}
