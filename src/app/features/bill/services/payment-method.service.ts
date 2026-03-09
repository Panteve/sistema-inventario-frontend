import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { PaymentMethodResponse } from '../../../shared/interfaces/paymentMethod.interface';
import { environment } from '../../../../environments/environment';


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
