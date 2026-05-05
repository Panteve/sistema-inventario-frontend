import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { ProductOnInventoryResponse } from '../../../../shared/interfaces/product.interface';
import { ProductSelected } from '../../../../shared/interfaces/bill.interface';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { InventoryStore } from '../../../../shared/store/inventory-store';
import { BillStore } from '../../store/bill-store';
import { TableProducts } from '../../../../shared/layouts/table-products/table-products';
import { InventoryService } from '../../../../shared/services/inventory.service';

@Component({
  selector: 'app-product-panel',
  imports: [RouterOutlet, TableProducts],
  providers: [],
  templateUrl: './product-panel.html',
})
export class ProductPanel {
  constructor() {
    effect(() => {
      if (this.#inventoryService.modalClose()) {
        this.btnCerrar.nativeElement.click();
      }
    });
  }

  #inventoryService = inject(InventoryService);
  #route = inject(ActivatedRoute);
  inventoryStore = inject(InventoryStore);
  billStore = inject(BillStore);
  router = inject(Router);

  @ViewChild('btnCerrar') btnCerrar!: ElementRef<HTMLButtonElement>;
  @ViewChild('my_modal_2') productModal!: ElementRef<HTMLDialogElement>;

  async getProductTable(product: ProductOnInventoryResponse) {
    this.#inventoryService.modalClose.set(false);

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
      { relativeTo: this.#route },
    );

    if (navigated) {
      this.productModal.nativeElement.showModal();
    }
  }
}
