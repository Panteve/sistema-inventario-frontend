import { Component, inject } from '@angular/core';
import { OfficeStore } from '../../../shared/store/office-store';
import { InventoryStore } from '../../../shared/store/inventory-store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard.component',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  officeStore = inject(OfficeStore);
  inventoryStore = inject(InventoryStore);
  #router = inject(Router);

  view() {
    this.#router.navigate(['/view-bills/bill', 10]);
  }
}
