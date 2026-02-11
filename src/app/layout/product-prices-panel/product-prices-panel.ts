import { Component, computed, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductInterface } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { BillService } from '../../services/bill.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-prices-panel',
  imports: [CurrencyPipe],
  templateUrl: './product-prices-panel.html',
  styleUrl: './product-prices-panel.css',
})
export class ProductPricesPanel{
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);
  private billService = inject(BillService);
  private productService = inject(ProductService);

  product = this.productService.productSelected;

  addProduct(price: string) {
    if(price === 'unitPrice') {
      this.product().priceSelected = this.product().unitPrice;
    } else if(price === 'wholesalePrice') {
      this.product().priceSelected = this.product().wholesalePrice;
    }
    this.billService.productsOnBill.update((products) => [...products, this.product()]);
    this.productService.modalClose.set(true);
  }
}
