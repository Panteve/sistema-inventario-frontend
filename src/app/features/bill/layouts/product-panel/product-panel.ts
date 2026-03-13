import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ProductResponse } from '../../../../shared/interfaces/product.interface';
import { ProductSelected } from '../../../../shared/interfaces/bill.interface';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ProductStore } from '../../store/product-store';
import { ErrorStore } from '../../../../core/store/errors-store';
import { BillStore } from '../../store/bill-store';
import { TableProducts } from '../../../../shared/layouts/table-products/table-products';

@Component({
  selector: 'app-product-panel',
  imports: [RouterOutlet, TableProducts],
  providers: [],
  templateUrl: './product-panel.html',
  styleUrl: './product-panel.css',
})
export class ProductPanel {
  constructor() {
    effect(() => {
      if (this.productService.modalClose()) {
        this.btnCerrar.nativeElement.click();
      }
    });
  }

  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  productStore = inject(ProductStore);
  billStore = inject(BillStore);
  errorStore = inject(ErrorStore);
  router = inject(Router);

  @ViewChild('btnCerrar') btnCerrar!: ElementRef<HTMLButtonElement>;
  @ViewChild('my_modal_2') productModal!: ElementRef<HTMLDialogElement>;

  async getProductTable(product: ProductResponse) {
    this.productService.modalClose.set(false);

    const productSelected: ProductSelected = {
      product: {
        id: product.product.id,
        name: product.product.name,
        unitPrice: product.product.unitPrice,
        wholesalePrice: product.product.wholesalePrice,
      },
      priceSelected: 0,
      quantity: 0,
    };
    this.billStore.setSelectedProduct(productSelected);

    const navigated = await this.router.navigate(
      [{ outlets: { 'select-product-price': ['product-prices'] } }],
      { relativeTo: this.route },
    );

    if (navigated) {
      this.productModal.nativeElement.showModal();
    }
  }
}
