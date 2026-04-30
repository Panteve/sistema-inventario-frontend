import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateProductRequest, ProductCatalogResponse, ProductOnInventoryResponse } from '../interfaces/product.interface';
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

  loadProductsCatalog(showDeleted: boolean = false) {
    const queryParams = showDeleted ? { showDeleted: true } : { showDeleted: false};
    return this.http.get<ProductCatalogResponse[]>(`${environment.apiUrl}/products`,{
      params: queryParams,
    });
  }

  createProduct(product: CreateProductRequest) {
    return this.http.post<void>(`${environment.apiUrl}/products/product`, product);
  }

  updateProduct(id: number, product: Partial<CreateProductRequest>) {
    return this.http.patch<void>(`${environment.apiUrl}/products/update/${id}`, product);
  }

  toggleStatusProduct(id: number) {
    return this.http.patch<void>(`${environment.apiUrl}/products/toggle-status/${id}`, {});
  }

}
