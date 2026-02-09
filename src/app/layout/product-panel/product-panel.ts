import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-panel',
  imports: [],
  templateUrl: './product-panel.html',
  styleUrl: './product-panel.css',
})
export class ProductPanel {
  private productService = inject(ProductService);

  products = this.productService.products.asReadonly();
  error = this.productService.error.asReadonly();
  loading = signal<boolean>(false);

  loadProducts() {
    this.loading.set(true);
     this.productService.loadProducts().add(() => {
       this.loading.set(false);
     });
  }
}
