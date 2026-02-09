import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ProductInterface } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  createProduct(product: ProductInterface): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiUrl}/products/product`, product).subscribe({
        next: () => resolve(true),
        error: (err) => reject(err),
      });
    });
  }

  getProducts(): Promise<ProductInterface[]> {
    return new Promise((resolve, reject) => {
      this.http.get<ProductInterface[]>(`${environment.apiUrl}/products`).subscribe({
        next: (products) => resolve(products),
        error: (err) => reject(err),
      });
    });
  }
}
