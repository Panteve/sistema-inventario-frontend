import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Product } from '../interfaces/product.interface';
import { AuthStore } from '../store/auth-store';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);

  modalClose = signal<boolean>(false);


  loadProducts() {
    return this.http.get<Product[]>(`${environment.apiUrl}/office-inventory/${this.authStore.employee()?.officeId || 0}`)
  }

  createProduct(product: Product) {
    return this.http.post<void>(`${environment.apiUrl}/products/product`, product);
  }
}
