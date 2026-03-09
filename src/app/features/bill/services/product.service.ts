import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from  '../../../../environments/environment';
import { ProductResponse } from '../../../shared/interfaces/product.interface';
import { AuthStore } from '../../../core/store/auth-store';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);

  modalClose = signal<boolean>(false);


  loadProducts() {
    return this.http.get<ProductResponse[]>(`${environment.apiUrl}/office-inventory/${this.authStore.employee()?.officeId || 0}`)
  }

  createProduct(product: ProductResponse) {
    return this.http.post<void>(`${environment.apiUrl}/products/product`, product);
  }
}
