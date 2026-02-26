import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Product } from '../interfaces/product.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  products = signal<Product[]>([]);
  productSelected = signal<Product>({
    product: { id: 0, name: '', unitPrice: 0, wholesalePrice: 0, status: true },
    quantity: 0,
  });
  modalClose = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string>('');

  loadProducts() {
    this.loading.set(true);
    this.http
      .get<Product[]>(`${environment.apiUrl}/office-inventory/${this.authService.getOfficeId()}`)
      .subscribe({
        next: (products) => {
          this.error.set('');
          this.products.set(products);
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
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  createProduct(product: Product) {
    return this.http.post<void>(`${environment.apiUrl}/products/product`, product);
  }
}
