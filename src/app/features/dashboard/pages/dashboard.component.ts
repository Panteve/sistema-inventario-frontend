import { Component, inject } from '@angular/core';
import { OfficeStore } from '../../../shared/store/office-store';
import { ProductStore } from '../../../shared/store/product-store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard.component',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  officeStore = inject(OfficeStore);
  productStore = inject(ProductStore);
  private router = inject(Router);

  view() {
    this.router.navigate(['/view-bills/bill',10]);
  }

}
