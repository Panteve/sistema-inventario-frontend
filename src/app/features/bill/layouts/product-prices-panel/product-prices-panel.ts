import { Component, inject } from '@angular/core';
import { InventoryStore } from '../../../../shared/store/inventory-store';
import { BillStore } from '../../store/bill-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { InventoryService } from '../../../../shared/services/inventory.service';

@Component({
  selector: 'app-product-prices-panel',
  imports: [CopPipe],
  templateUrl: './product-prices-panel.html',
})
export class ProductPricesPanel {
  private inventoryService = inject(InventoryService);
  inventoryStore = inject(InventoryStore);
  billStore = inject(BillStore);

  addProductToBill(price: string) {
    this.billStore.setPriceSelected(price);
    this.billStore.addProduct();
    this.inventoryService.modalClose.set(true);
  }
}
