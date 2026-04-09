import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductCatalogResponse, ProductOnInventoryResponse } from '../interfaces/product.interface';
import { AuthStore } from '../../core/store/auth-store';
import { OfficeStore } from '../store/office-store';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private officeStore = inject(OfficeStore);

  modalClose = signal<boolean>(false);

  loadProductsOnInventory() {
    const officeId: number = this.authStore.employee()?.officeId || this.officeStore.offices()[0]?.id;
    return this.http.get<ProductOnInventoryResponse[]>(
      `${environment.apiUrl}/office-inventory/${officeId}`,
    );
  }

  loadProductsCatalog() {
    return this.http.get<ProductCatalogResponse[]>(`${environment.apiUrl}/products`);
  }

  createProduct(product: ProductOnInventoryResponse) {
    return this.http.post<void>(`${environment.apiUrl}/products/product`, product);
  }
}
