import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateProductRequest, ProductCatalogResponse } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  #http = inject(HttpClient);

  loadProductsCatalog(showDeleted: boolean = true) {
    let queryParams = {};
    if (showDeleted) {
      queryParams = { showDeleted: true };
    }
    return this.#http.get<ProductCatalogResponse[]>(`${environment.apiUrl}/products`, {
      params: queryParams,
    });
  }

  createProduct(product: CreateProductRequest) {
    return this.#http.post<ProductCatalogResponse>(`${environment.apiUrl}/products/product`, product);
  }

  updateProduct(id: number, product: Partial<CreateProductRequest>) {
    return this.#http.patch<void>(`${environment.apiUrl}/products/update/${id}`, product);
  }

  setStatusProduct(id: number, status: boolean) {
    return this.#http.patch<void>(`${environment.apiUrl}/products/status/${id}`, { status });
  }
}
