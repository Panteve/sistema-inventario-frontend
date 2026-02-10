import {
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
  effect,
  untracked,
} from '@angular/core';
import { BillInterface } from '../../interfaces/bill.interface';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { BillService } from '../../services/bill.service';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-bill.component',
  imports: [RouterOutlet],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent implements OnInit {
  constructor() {
    effect(() => {
      this.billService.productsOnBill();
      untracked(() => {
        if (this.modalAbierto()) {
          this.btnCerrrar.nativeElement.click();
          this.modalAbierto.set(false);
        }
      });
    });
  }

  private billService = inject(BillService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  router = inject(Router);

  @ViewChild('cerrarBtn') btnCerrrar!: ElementRef<HTMLButtonElement>;

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
