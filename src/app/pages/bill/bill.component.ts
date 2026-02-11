import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { BillInterface } from '../../interfaces/bill.interface';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { BillService } from '../../services/bill.service';
import { Router, RouterOutlet } from '@angular/router';
import { ProductInterface } from '../../interfaces/product.interface';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-bill.component',
  imports: [RouterOutlet, CurrencyPipe],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent implements OnInit {

  private billService = inject(BillService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  router = inject(Router);

  productsOnBill =this.billService.productsOnBill;
  modalAbierto = signal<boolean>(false);
  error = this.productService.error.asReadonly();

  products = this.productService.products.asReadonly();

  billModel = signal<BillInterface>({
    userId: undefined,
    paymentMethodId: 1,
    employeeId: this.authService.getEmployeeId(),
    products: [],
  });

  ngOnInit(): void {
    this.productService.loadProducts();
  }
}
