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
    this.http.get<PaymentMethod[]>(`${environment.apiUrl}/payment-method`).subscribe({
      next: (paymentMethods) => {
        this.paymentMethods.set(paymentMethods);
      },
      error: (err) => {
        if (err.status === 401) {
          this.error.set('No autorizado. Por favor, inicie sesión de nuevo.');
        } else {
          this.error.set(
            'Error de conexión con el servidor. Por favor, inténtelo de nuevo más tarde.',
          );
        }
      },
    });
  }
}
