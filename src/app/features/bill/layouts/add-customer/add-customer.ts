import { ChangeDetectionStrategy, Component, effect, inject, model, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  CreateCustomerRequest,
  Role,
  UpdateCustomerRequest,
} from '../../../../shared/interfaces/customer-interface';
import { CustomerService } from '../../services/customer.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-add-customer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './add-customer.html',
})
export class AgregarCliente {
  customerService = inject(CustomerService);
  toastService = inject(ToastService);

  rolesCustomer = [
    { id: 1, name: 'Natural', code: 'CLIENT' as Role },
    { id: 2, name: 'Negocio', code: 'BUSINESS' as Role },
  ];

  customer = model<CreateCustomerRequest | null>(null);
  editarClienteActivo = signal<boolean>(false);
  newCustomer = signal<boolean>(false);
  loading = signal<boolean>(false);

  clearCustomer = model<boolean>(false);

  constructor() {
    effect(() => {
      if (this.customer()) {
        this.customerForm.patchValue({
          document: this.customer()?.document,
          name: this.customer()?.name,
          email: this.customer()?.email,
          phone: this.customer()?.phone,
          role: this.customer()?.role,
        });
        this.customerForm.disable();
        this.customerForm.get('document')?.enable();
      } else if (this.newCustomer()) {
        this.customerForm.enable();
        this.customerForm.patchValue({
          name: '',
          email: '',
          phone: '',
          role: this.rolesCustomer[0].name,
        });
      }
    });
    effect(() => {
      if (this.clearCustomer()) {
        this.limpiarBusqueda();
        this.clearCustomer.set(false);
      }
    });
  }

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

  limpiarBusqueda() {
    this.customer.set(null);
    this.newCustomer.set(false);
    this.customerForm.reset();
  }

  enableEditarCliente() {
    this.customerForm.enable();
    this.customerForm.get('document')?.disable();
    this.editarClienteActivo.set(true);
  }
  disabledEditarCliente() {
    this.customerForm.disable();
    this.customerForm.get('document')?.enable();
    this.editarClienteActivo.set(false);
  }

  buscarCliente() {
    const document = this.customerForm.get('document')?.value;
    if (this.customerForm.get('document')?.valid && document) {
      this.loading.set(true);
      this.customer.set(null);
      this.newCustomer.set(false);
      this.customerService.searchCustomerByDoc(document).subscribe({
        next: (customer) => {
          this.customer.set(customer);
          this.loading.set(false);
        },
        error: (error) => {
          if (error.status === 404) {
            this.newCustomer.set(true);
            this.toastService.show({
              title: 'Cliente no encontrado',
              content: 'El cliente no existe, por favor ingresa los datos para crearlo.',
              type: 'info',
            });
          } else {
            this.toastService.show({
              title: 'Error al buscar el cliente',
              content: 'Ocurrió un error al buscar el cliente.',
              type: 'error',
            });
          }
          this.loading.set(false);
        },
      });
    }
  }

  editarCliente() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const currentCustomer = this.customer();
    const formValue = this.customerForm.getRawValue();

    const payload: UpdateCustomerRequest = {};

    if (!currentCustomer || formValue.name !== currentCustomer.name) {
      payload.name = formValue.name!;
    }
    if (!currentCustomer || formValue.email !== currentCustomer.email) {
      payload.email = formValue.email!;
    }
    if (!currentCustomer || formValue.phone !== currentCustomer.phone) {
      payload.phone = formValue.phone!;
    }
    if (!currentCustomer || (formValue.role as Role) !== currentCustomer.role) {
      payload.role = formValue.role as Role;
    }
    if (!formValue.document) {
      this.toastService.show({
        title: 'Documento inválido',
        content: 'El documento no puede estar vacío.',
        type: 'error',
      });
      return;
    }
    this.customerService.updateCustomerByDoc(formValue.document, payload).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.toastService.show({
          title: 'Cliente actualizado',
          content: 'El cliente ha sido actualizado exitosamente.',
          type: 'success',
        });
        this.disabledEditarCliente();
        this.loading.set(false);
      },
      error: (error) => {
        if (error.status === 400) {
          this.toastService.show({
            title: 'Error al actualizar el cliente',
            content: 'Verifique los datos ingresados.',
            type: 'error',
          });
        } else {
          this.toastService.show({
            title: 'Error al actualizar el cliente',
            content: 'Ocurrió un error al actualizar el cliente.',
            type: 'error',
          });
        }
        this.loading.set(false);
      },
    });
  }

  crearCliente() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const formValue = this.customerForm.getRawValue();
    const customerData: CreateCustomerRequest = {
      document: formValue.document!,
      name: formValue.name!,
      email: formValue.email!,
      phone: formValue.phone!,
      role: formValue.role as Role,
    };

    this.customerService.createCustomer(customerData).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.newCustomer.set(false);
        this.toastService.show({
          title: 'Cliente creado',
          content: 'El cliente ha sido creado exitosamente.',
          type: 'success',
        });
        this.loading.set(false);
      },
      error: (error) => {
        if (error.status === 400) {
          this.toastService.show({
            title: 'Error al crear el cliente',
            content: 'Verifique los datos ingresados.',
            type: 'error',
          });
        } else {
          this.toastService.show({
            title: 'Error al crear el cliente',
            content: 'Ocurrió un error al crear el cliente.',
            type: 'error',
          });
        }
        this.loading.set(false);
      },
    });
  }

}
