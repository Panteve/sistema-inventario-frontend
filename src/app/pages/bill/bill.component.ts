import { Component, inject, OnInit, signal } from '@angular/core';
import { BillInterface } from '../../interfaces/bill.interface';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { BillService } from '../../services/bill.service';
import { Router, RouterOutlet } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PaymentMethodService } from '../../services/payment-method.service';
import { form } from '@angular/forms/signals';

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
  private paymentMethodService = inject(PaymentMethodService);
  router = inject(Router);

  productsOnBill = this.billService.productsOnBill;
  paymentMethods = this.paymentMethodService.paymentMethods.asReadonly();
  subtotal = this.billService.subtotal;
  iva = this.billService.iva;
  total = this.billService.total;
  error = this.billService.error;

  productInputId = signal<number>(0);
  modifiyingPrice = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);
  billCreated = signal<boolean>(false);
  loading = signal<boolean>(false);

  billModel = signal<BillInterface>({
    userId: undefined,
    paymentMethodId: 0,
    employeeId: this.authService.getEmployeeId(),
  });

  selectAll(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  modifyingQuantity(event: Event, productId: number) {
    let quantity = (event.target as HTMLInputElement).value;
    if (quantity === '' || Number(quantity) < 1) {
      (event.target as HTMLInputElement).value = '1';
      return;
    }
    this.billService.productsOnBill.update((products) => {
      return products.map((p) => {
        if (p.productId === productId) {
          return { ...p, quantity: Number(quantity) };
        }
        return p;
      });
    });
  }

  finishModifyPrice(event: Event, productId: number) {
    const price = (event.target as HTMLInputElement).value;
    this.billService.productsOnBill.update((products) => {
      return products.map((p) => {
        if (price === '' || Number(price) < 1) {
          return p;
        }
        if (p.productId === productId) {
          return { ...p, price: Number(price) };
        }
        return p;
      });
    });
    this.modifiyingPrice.set(false);
  }

  setPaymentMethod(id: number) {
    this.billModel().paymentMethodId = id;
  }

  createBill() {
    this.loading.set(true);
    this.billService.createBill(this.billModel()).subscribe({
        next: (response: any) => {
          this.billService.billId.set(response);
          this.billCreated.set(true);
          this.loading.set(false);
          this.router.navigate([`/bill/${this.billService.billId()}`]);
        },
        error: (err) =>{
          if (err.status === 401) {
            this.billService.error.set('No autorizado. Por favor, inicie sesión de nuevo.');
          } else if (err.status === 400) {
              switch (err.error.id) {
                case 1:
                  this.billService.error.set('La factura debe tener al menos un producto');
                  break;
                case 2:
                  this.billService.error.set('Debe seleccionar un método de pago');
                  break;
                default:
                  this.billService.error.set('Error al crear la factura. Por favor, revise la información e intente de nuevo.');
              }
          } else if (err.status === 404) {
            this.billService.error.set('No se encontró algún recurso necesario para crear la factura. Por favor, revise la información e intente de nuevo.');
          } else {
            this.billService.error.set('Error de conexión con el servidor. Por favor, inténtelo de nuevo más tarde.');
          }
          this.loading.set(false);
          setTimeout(() => {
            this.billService.error.set('');
          }, 6000)
        },
    });
  }

  cancelBill() {
    this.billService.productsOnBill.set([]);
    this.router.navigate(['/bill']);
  }

  ngOnInit(): void {
    this.productService.loadProducts();
    this.paymentMethodService.loadPaymentMethods();
  }
}
