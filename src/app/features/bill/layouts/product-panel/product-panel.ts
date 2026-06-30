import { Component, inject, signal } from '@angular/core';
import { ProductOnInventoryResponse } from '../../../../shared/interfaces/product.interface';
import { ProductSelected } from '../../../../shared/interfaces/bill.interface';
import { Router } from '@angular/router';
import { InventoryStore } from '../../../../shared/store/inventory-store';
import { BillStore } from '../../store/bill-store';
import { TableProducts } from '../../../../shared/layouts/table-products/table-products';
import { ProductPricesPanel } from '../product-prices-panel/product-prices-panel';
import { ModalComponent } from '../../../../shared/components/modal.component/modal.component';

@Component({
  selector: 'app-product-panel',
  imports: [TableProducts, ProductPricesPanel, ModalComponent],
  providers: [],
  templateUrl: './product-panel.html',
})
export class ProductPanel {
  inventoryStore = inject(InventoryStore);
  billStore = inject(BillStore);
  router = inject(Router);


  priceModalOpen = signal<boolean>(false);

  productSelected = signal<ProductSelected>({
    id: 0,
    unitPrice: 0,
    wholesalePrice: 0,
    name: '',
    priceSelected: 0,
    quantity: 0,
    taxpercentage: 0,
  });

  onPriceSelected(price: number) {
    this.productSelected.update((current) => ({
      ...current,
      priceSelected: price,
    }));
    this.billStore.addProduct(this.productSelected());
    this.priceModalOpen.set(false);
  }

  async getProductTable(product: ProductOnInventoryResponse) {
    this.priceModalOpen.set(true);
    const productSelected: ProductSelected = {
      id: product.product.id,
      name: product.product.name,
      unitPrice: product.product.unitPrice,
      wholesalePrice: product.product.wholesalePrice,
      taxpercentage: product.product.taxPercentage,
      priceSelected: 0,
      quantity: 0,
    };
    this.productSelected.set(productSelected);
  }
}
