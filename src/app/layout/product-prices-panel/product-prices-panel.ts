import { Component, computed, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductInterface } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-prices-panel',
  imports: [],
  templateUrl: './product-prices-panel.html',
  styleUrl: './product-prices-panel.css',
})
export class ProductPricesPanel implements OnDestroy{
  ngOnDestroy(): void {
    console.log('Destruyendo ProductPricesPanel');
  }
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);
  private productService = inject(ProductService);

  product = computed(() => this.data()?.['product'] as ProductInterface);

}
