import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductCatalogResponse, ProductOnInventoryResponse } from '../interfaces/product.interface';
import { AuthStore } from '../../core/store/auth-store';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private  authStore = inject(AuthStore);
  modalClose = signal<boolean>(false);

  loadProductsOnInventory() {
    const officeId = this.authStore.employee()?.officeId;
    return this.http.get<ProductOnInventoryResponse[]>(
      `${environment.apiUrl}/office-inventory/`,{params: { officeId: officeId ? String(officeId) : 0 }}
    );
  }

  loadProductsCatalog() {
    return this.http.get<ProductCatalogResponse[]>(`${environment.apiUrl}/products`);
  }

  createProduct(product: ProductOnInventoryResponse) {
    return this.http.post<void>(`${environment.apiUrl}/products/product`, product);
  }
}
