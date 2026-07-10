import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { ProductSelected } from '../../../../shared/interfaces/bill.interface';

@Component({
  selector: 'app-product-prices-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'onKeydown($event)',
  },
  imports: [CopPipe],
  templateUrl: './product-prices-panel.html',
})
export class ProductPricesPanel {
  product = input.required<ProductSelected>();
  priceSelected = output<number>();

  highlightedPriceIndex = signal<number>(0);

  addProductToBill(price: number) {
    this.priceSelected.emit(price);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedPriceIndex.update((i) => (i >= 1 ? 0 : i + 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedPriceIndex.update((i) => (i <= 0 ? 1 : i - 1));
      return;
    }

    if (event.key === 'Enter') {
      const idx = this.highlightedPriceIndex();
      event.preventDefault();
      if (idx === 0) {
        this.addProductToBill(this.product().unitPrice);
      } else {
        this.addProductToBill(this.product().wholesalePrice);
      }
      return;
    }
  }
}
