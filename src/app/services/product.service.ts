import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ProductInterface } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  products = signal<ProductInterface[]>([]);
  productSelected = signal<ProductInterface>({id: 0, name: '', unitPrice: 0, wholesalePrice: 0, stock: 0});
  modalClose = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string>('');


  loadProducts() {
    this.loading.set(true);
    return this.http.get<ProductInterface[]>(`${environment.apiUrl}/products`).subscribe({
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
      }
    });
  }

  createProduct(product: ProductInterface) {
    return this.http.post<void>(`${environment.apiUrl}/products/product`, product);
  }
}
