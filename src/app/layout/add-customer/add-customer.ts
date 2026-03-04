import { Component, effect, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CustomerStore } from '../../store/customer-store';
import { ErrorStore } from '../../store/errors-store';
import { Role, UpdateCustomerRequest } from '../../interfaces/customer-interface';

@Component({
  selector: 'app-agregar-cliente',
  imports: [ReactiveFormsModule],
  providers: [],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.css',
})
export class AgregarCliente {
  constructor() {
    effect(() => {
      if (this.customerStore.customer()) {
        this.customerForm.patchValue({
          document: this.customerStore.customer()?.document,
          name: this.customerStore.customer()?.name,
          email: this.customerStore.customer()?.email,
          phone: this.customerStore.customer()?.phone,
          role: this.customerStore.customer()?.role,
        });
        this.customerForm.disable();
        this.customerForm.get('document')?.enable();
      } else if (this.customerStore.newCustomer()) {
        this.customerForm.enable();
        this.customerForm.patchValue({
          name: '',
          email: '',
          phone: '',
          role: this.rolesCustomer[0].name,
        });
      }
    });
  }

  customerStore = inject(CustomerStore);
  errorStore = inject(ErrorStore);
;
  rolesCustomer = [
    { id: 1, name: 'Natural', code: 'CLIENT' as Role },
    { id: 2, name: 'Negocio', code: 'BUSINESS' as Role },
  ];

  validoParaEnviar: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const document = control.get('document');
    const role = control.get('role');
    return document?.value && role?.value ? null : { validoParaEnviar: true };
  };

  customerForm = new FormGroup(
    {
      document: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.minLength(5),
        Validators.maxLength(15),
      ]),
      name: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]+$'),
        Validators.maxLength(50),
      ]),
      email: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.email,
      ]),
      phone: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.minLength(5),
        Validators.maxLength(15),
      ]),
      role: new FormControl({ value: this.rolesCustomer[0].name, disabled: true }, [
        Validators.required,
        Validators.pattern('^(CLIENT|BUSINESS)$'),
      ]),
    },
    { validators: this.validoParaEnviar },
  );

  buscarCliente() {
    const document = this.customerForm.get('document')?.value;
    if(this.customerForm.get('document')?.valid && document) {
      this.customerStore.searchCustomer(document);
    }
  }

  limpiarBusqueda() {
    this.customerStore.clearCustomer();
    this.customerForm.reset();
  }

  enableEditarCliente() {
    this.customerForm.enable();
    this.customerForm.get('document')?.disable();
    this.customerStore.changeEditarClienteActivo(true);
  }
  disabledEditarCliente() {
    this.customerForm.disable();
    this.customerForm.get('document')?.enable();
    this.customerStore.changeEditarClienteActivo(false);
  }

  editarCliente() {
    if (this.customerForm.valid) {
      const currentCustomer = this.customerStore.customer();
      const formValue = this.customerForm.getRawValue();

      const payload: UpdateCustomerRequest = {
      };

      if (!currentCustomer || formValue.name !== currentCustomer.name) {
        payload.name = formValue.name ?? '';
      }
      if (!currentCustomer || formValue.email !== currentCustomer.email) {
        payload.email = formValue.email ?? '';
      }
      if (!currentCustomer || formValue.phone !== currentCustomer.phone) {
        payload.phone = formValue.phone ?? '';
      }
      if (!currentCustomer || (formValue.role as Role) !== currentCustomer.role) {
        payload.role = formValue.role as Role;
      }
      this.customerStore.updateCustomer({ document: formValue.document ?? '', customerData: payload });
    }
  }

  crearCliente() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    const formValue = this.customerForm.getRawValue();
    this.customerStore.createCustomer({
      document: formValue.document ?? '',
      name: formValue.name ?? '',
      email: formValue.email ?? '',
      phone: formValue.phone ?? '',
      role: formValue.role as Role,
    });
  }
}
