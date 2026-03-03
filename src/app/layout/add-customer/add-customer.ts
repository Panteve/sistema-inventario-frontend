import { Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerStore } from '../../store/customer-store';
import { ErrorStore } from '../../store/errors-store';

@Component({
  selector: 'app-agregar-cliente',
  imports: [ReactiveFormsModule],
  providers: [CustomerStore],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.css',
})
export class AgregarCliente {
  constructor() {
    effect(() => {
      if (this.customerStore.customer()) {
        this.customerForm.patchValue({
          name: this.customerStore.customer()?.name,
          email: this.customerStore.customer()?.email,
          phone: this.customerStore.customer()?.phone,
          type: this.customerStore.customer()?.role,
        });
      } else if (this.customerStore.newCustomer()) {
        this.customerForm.enable();
        this.customerForm.patchValue({
          name: '',
          email: '',
          phone: '',
          type: this.typesCustomer[0].name,
        });
      }
    });
  }

  customerStore = inject(CustomerStore);
  errorStore = inject(ErrorStore);

  typesCustomer = [
    { id: 1, name: 'Natural', code: 'CLIENT' },
    { id: 2, name: 'Negocio', code: 'BUSINESS' },
  ];

  customerForm = new FormGroup({
    document: new FormControl(''),
    name: new FormControl({ value: '', disabled: true }),
    email: new FormControl({ value: '', disabled: true }),
    phone: new FormControl({ value: '', disabled: true }),
    type: new FormControl({ value: this.typesCustomer[0].name, disabled: true }),
  });

  buscarCliente() {
    const document = this.customerForm.get('document')?.value;
    if (document) this.customerStore.searchCustomer(document);
  }

  limpiarBusqueda() {}
}
