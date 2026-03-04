import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CurrencyPipe } from '@angular/common';
import { ProductStore } from '../../store/product-store';
import { BillStore } from '../../store/bill-store';

@Component({
  selector: 'app-product-prices-panel',
  imports: [CurrencyPipe],
  templateUrl: './product-prices-panel.html',
  styleUrl: './product-prices-panel.css',
})
export class ProductPricesPanel {
  private productService = inject(ProductService);
  productStore = inject(ProductStore);
  billStore = inject(BillStore);

  addProductToBill(price: string) {
    this.billStore.setPriceSelected(price);
    this.billStore.addProduct();
    this.productService.modalClose.set(true);
  }
}
