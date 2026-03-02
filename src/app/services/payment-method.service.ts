import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaymentMethod } from '../interfaces/paymentMethod.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  private http = inject(HttpClient);

  paymentMethods = signal<PaymentMethod[]>([]);
  error = signal<string>('');

  loadPaymentMethods() {
    return this.http.get<PaymentMethod[]>(`${environment.apiUrl}/payment-method`);
  }
}
