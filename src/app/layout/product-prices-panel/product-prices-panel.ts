import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { BillService } from '../../services/bill.service';
import { CurrencyPipe } from '@angular/common';
import { ProductOnBillInterface } from '../../interfaces/product-on-bill.interface';

@Component({
  selector: 'app-product-prices-panel',
  imports: [CurrencyPipe],
  templateUrl: './product-prices-panel.html',
  styleUrl: './product-prices-panel.css',
})
export class ProductPricesPanel {
  private billService = inject(BillService);
  private productService = inject(ProductService);

  product = this.productService.productSelected;

  addProductToBill(price: string) {
    if (price === 'unitPrice') {
      this.product().priceSelected = this.product().product.unitPrice;
    } else if (price === 'wholesalePrice') {
      this.product().priceSelected = this.product().product.wholesalePrice;
    }
    this.billService.productsOnBill.update((products) => {
      const { name, id } = this.product().product;
      const producTo: ProductOnBillInterface = {
        name,
        productId: id,
        price: this.product().priceSelected,
        quantity: 1,
      };
      if (!products.some((p) => p.productId === id)) {
        return [...products, producTo];
      } else {
        return products.map((p) => {
          if (p.productId === id) {
            return { ...p, quantity: p.quantity + 1 };
          }
          return p;
        });
      }
    });
    this.productService.modalClose.set(true);
  }
}
