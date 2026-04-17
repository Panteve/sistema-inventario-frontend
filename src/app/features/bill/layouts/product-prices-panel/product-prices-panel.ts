import { Component, inject } from '@angular/core';
import { ProductService } from '../../../../shared/services/product.service';
import { ProductStore } from '../../../../shared/store/product-store';
import { BillStore } from '../../store/bill-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';

@Component({
  selector: 'app-product-prices-panel',
  imports: [CopPipe],
  templateUrl: './product-prices-panel.html',
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
