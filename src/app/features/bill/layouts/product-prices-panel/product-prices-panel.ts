import { Component, input, output } from '@angular/core';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { ProductSelected } from '../../../../shared/interfaces/bill.interface';

@Component({
  selector: 'app-product-prices-panel',
  imports: [CopPipe],
  templateUrl: './product-prices-panel.html',
})
export class ProductPricesPanel {
  product = input.required<ProductSelected>();
  priceSelected = output<number>();

  addProductToBill(price: number) {
    this.priceSelected.emit(price);
  }
}
