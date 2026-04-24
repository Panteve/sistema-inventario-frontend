import { Component, effect, inject, signal } from '@angular/core';
import { PaymentMethodStore } from '../../../../shared/store/payment-method-store';
import {
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/angular-table';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethodService } from '../../../../shared/services/payment-method.service';
import { PaymentMethodResponse } from '../../../../shared/interfaces/paymentMethod.interface';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-payment-method.component',
  imports: [FlexRenderDirective, ReactiveFormsModule],
  templateUrl: './payment-method.component.html',
})
export class PaymentMethodComponent {
  paymentMethodStore = inject(PaymentMethodStore);
  paymentMethodService = inject(PaymentMethodService);
  toastService = inject(ToastService);

  globalFilter = signal<string>('');
  numberPage = signal<number>(1);
  methodExist = signal<boolean>(false);
  loading = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (!this.methodExist()) {
        this.paymentMethodForm.get('status')?.disable();
        this.paymentMethodForm.get('status')?.setValue(true);
      } else {
        this.paymentMethodForm.get('status')?.enable();
      }
    });
  }
  loadPaymentMethods() {
    this.globalFilter.set('');
    this.paymentMethodStore.loadPaymentMethods();
  }

  table = createAngularTable(() => ({
    data: this.paymentMethodStore.paymentMethods(),
    columns: [
      {
        header: 'ID',
        accessorKey: 'id',
        id: 'id',
      },
      {
        header: 'Metodo de pago',
        accessorKey: 'name',
        id: 'name',
      },
      {
        header: 'Codigo',
        accessorKey: 'code',
        id: 'code',
      },
      {
        header: 'Affecta caja',
        accessorKey: 'affectsCash',
        id: 'affectsCash',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        id: 'status',
      },
    ],
    state: {
      globalFilter: this.globalFilter(),
    },
    onGlobalFilterChange: (value) => {
      this.globalFilter.set(value as string);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId)).toLowerCase();
      return value.includes(filterValue.toLowerCase());
    },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 7,
      },
    },
  }));

  resetViewTable() {
    this.table.setPageIndex(0);
    this.numberPage.set(1);
  }

  nextPage() {
    this.table.nextPage();
    this.numberPage.update((n) => n + 1);
  }

  previousPage() {
    this.table.previousPage();
    this.numberPage.update((n) => n - 1);
  }

  paymentMethodForm = new FormGroup({
    id: new FormControl<number>(0, {
      nonNullable: true,
      validators: Validators.required,
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_ ]+$/)],
    }),
    code: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)],
    }),
    affectsCash: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
    status: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
  });

  clearForm() {
    this.paymentMethodForm.reset({
      name: '',
      code: '',
      affectsCash: false,
      status: true,
    });
    this.methodExist.set(false);
  }
  onSubmit() {
    this.loading.set(true);
    const { id, ...paymentMethod } = this.paymentMethodForm.getRawValue();
    if (this.methodExist()) {
      if (paymentMethod.status === false) {
        this.paymentMethodService
          .deletePaymentMethod(id)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (response) => {
              this.toastService.show({
                title: 'Método de pago desactivado',
                content: 'El método de pago ha sido desactivado exitosamente.',
                type: 'success',
              });
              this.loadPaymentMethods();
              this.clearForm();
            },
            error: () => {
              this.toastService.show({
                title: 'Error al desactivar método de pago',
                content: 'No se pudo desactivar el método de pago. Inténtalo de nuevo.',
                type: 'error',
              });
            },
          });
        return;
      }
      this.paymentMethodService
        .updatePaymentMethod(id, paymentMethod)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            this.toastService.show({
              title: 'Método de pago actualizado',
              content: 'El método de pago ha sido actualizado exitosamente.',
              type: 'success',
            });
            this.clearForm();
            this.loadPaymentMethods();
          },
          error: () => {
            this.toastService.show({
              title: 'Error al actualizar método de pago',
              content: 'No se pudo actualizar el método de pago. Inténtalo de nuevo.',
              type: 'error',
            });
          },
        });
    } else {
      this.paymentMethodService
        .createPaymentMethod(paymentMethod)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            this.toastService.show({
              title: 'Método de pago creado',
              content: 'El método de pago ha sido creado exitosamente.',
              type: 'success',
            });
            this.clearForm();
            this.loadPaymentMethods();
          },
          error: () => {
            this.toastService.show({
              title: 'Error al crear método de pago',
              content: 'No se pudo crear el método de pago. Inténtalo de nuevo.',
              type: 'error',
            });
          },
        });
    }
  }
  onRowClick(paymentMethod: PaymentMethodResponse) {
    this.methodExist.set(true);
    this.paymentMethodForm.setValue({
      id: paymentMethod.id,
      name: paymentMethod.name,
      code: paymentMethod.code,
      affectsCash: paymentMethod.affectsCash,
      status: paymentMethod.status,
    });
  }
}
