import { Component, inject, OnInit, signal } from '@angular/core';
import { BillInterface } from '../../interfaces/bill.interface';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { BillService } from '../../services/bill.service';
import { ProductInterface } from '../../interfaces/product.interface';

@Component({
  selector: 'app-bill.component',
  imports: [],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent implements OnInit {
  private billService = inject(BillService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);

  error = signal<string>('');
  loading = signal<boolean>(false);

  products: ProductInterface[] = [];

  loginModel = signal<BillInterface>({
    userId: undefined,
    paymentMethodId: 1,
    employeeId: this.authService.getEmployeeId(),
    products: [],
  });

  ngOnInit(): void {
    this.productService.getProducts().then((products) => {
      this.products = products;
    }).catch((err) => {
      console.error('Get products failed', err);
      if(err.status === 401 ) {
        this.error.set('No autorizado. Por favor, inicie sesión de nuevo.');
      }else{
        this.error.set('Error de conexión con el servidor. Por favor, inténtelo de nuevo más tarde.');
      }
      this.loading.set(false);
    });
  }

}
