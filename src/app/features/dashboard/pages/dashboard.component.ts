import { Component, inject } from '@angular/core';
import { NgFastToastComponent } from 'ng-fast-toast';
import { OfficeStore } from '../../../shared/store/office-store';
import { ProductStore } from '../../../shared/store/product-store';

@Component({
  selector: 'app-dashboard.component',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  officeStore = inject(OfficeStore);
    productStore = inject(ProductStore);

}
