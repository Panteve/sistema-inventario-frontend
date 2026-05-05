import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateProductRequest, ProductCatalogResponse } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  loadProductsCatalog(showDeleted: boolean = false) {
    let queryParams = {};
    if (showDeleted) {
      queryParams = { showDeleted: true };
    }
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

  setStatusProduct(id: number, status: boolean) {
    return this.http.patch<void>(`${environment.apiUrl}/products/status/${id}`, { status });
  }

}
