import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
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
import {
  CreatePaymentMethodRequest,
  PaymentMethodResponse,
} from '../../../../shared/interfaces/paymentMethod.interface';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-payment-method.component',
  imports: [FlexRenderDirective, ReactiveFormsModule],
  templateUrl: './payment-method.component.html',
})
export class PaymentMethodComponent {
  paymentMethodStore = inject(PaymentMethodStore);
  paymentMethodService = inject(PaymentMethodService);
  toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  paymentMethodSelected = signal<PaymentMethodResponse | null>(null);
  globalFilter = signal<string>('');
  numberPage = signal<number>(1);
  methodExist = signal<boolean>(false);
  loading = signal<boolean>(false);

  paymentMethodForm = new FormGroup({
    id: new FormControl<number>(0, {
      nonNullable: true,
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[\p{L}\p{N}_ ]+$/u)],
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

  private formValue = toSignal(this.paymentMethodForm.valueChanges, {
    initialValue: this.paymentMethodForm.getRawValue(),
  });
  hasChanges = computed(() => {
    const selected = this.paymentMethodSelected();
    const formValue = this.formValue();
    if (selected) {
      return (
        selected.name !== formValue.name ||
        selected.code !== formValue.code ||
        selected.affectsCash !== formValue.affectsCash ||
        selected.status !== formValue.status
      );
    }
    return true;
  });

  constructor() {
    effect(() => {
      if (!this.methodExist()) {
        this.paymentMethodForm.get('status')?.disable();
        this.paymentMethodForm.get('status')?.setValue(true);
      } else {
        this.paymentMethodForm.get('status')?.enable();
      }
    });

    this.paymentMethodForm
      .get('status')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          if (this.paymentMethodSelected()?.status === true) {
            this.paymentMethodForm.get('name')?.enable({ emitEvent: false });
            this.paymentMethodForm.get('code')?.enable({ emitEvent: false });
            this.paymentMethodForm.get('affectsCash')?.enable({ emitEvent: false });
          }
        } else {
          this.paymentMethodForm.get('name')?.disable({ emitEvent: false });
          this.paymentMethodForm
            .get('name')
            ?.setValue(this.paymentMethodSelected()?.name ?? '', { emitEvent: false });
          this.paymentMethodForm.get('code')?.disable({ emitEvent: false });
          this.paymentMethodForm
            .get('code')
            ?.setValue(this.paymentMethodSelected()?.code ?? '', { emitEvent: false });
          this.paymentMethodForm.get('affectsCash')?.disable({ emitEvent: false });
          this.paymentMethodForm
            .get('affectsCash')
            ?.setValue(this.paymentMethodSelected()?.affectsCash ?? false, { emitEvent: false });
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

  onRowClick(paymentMethod: PaymentMethodResponse) {
    this.methodExist.set(true);
    this.paymentMethodSelected.set(paymentMethod);
    this.paymentMethodForm.setValue({
      id: paymentMethod.id,
      name: paymentMethod.name,
      code: paymentMethod.code,
      affectsCash: paymentMethod.affectsCash,
      status: paymentMethod.status,
    });
  }

  clearForm() {
    this.paymentMethodForm.reset({
      name: '',
      code: '',
      affectsCash: false,
      status: true,
    });
    this.paymentMethodSelected.set(null);
    this.methodExist.set(false);
  }

  private setStatus(paymentMethod: PaymentMethodResponse) {
    this.paymentMethodService
      .setStatusPaymentMethod(paymentMethod.id, paymentMethod.status)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
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
  }

  private updatePaymentMethod(paymentMethod: PaymentMethodResponse) {
    const payload: Partial<CreatePaymentMethodRequest> = {};

    if (paymentMethod.name !== this.paymentMethodSelected()?.name) {
      payload['name'] = paymentMethod.name;
    }
    if (paymentMethod.code !== this.paymentMethodSelected()?.code) {
      payload['code'] = paymentMethod.code;
    }
    if (paymentMethod.affectsCash !== this.paymentMethodSelected()?.affectsCash) {
      payload['affectsCash'] = paymentMethod.affectsCash;
    }

    this.paymentMethodService
      .updatePaymentMethod(paymentMethod.id, payload as CreatePaymentMethodRequest)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show({
            title: 'Método de pago actualizado',
            content: `El método de pago ${paymentMethod.name} ha sido actualizado exitosamente.`,
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
  }

  private createPaymentMethod(paymentMethod: CreatePaymentMethodRequest) {
    this.paymentMethodService
      .createPaymentMethod(paymentMethod)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
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

  onSubmit() {
    this.loading.set(true);
    const paymentMethod = this.paymentMethodForm.getRawValue();
    if (this.methodExist()) {
      if (paymentMethod.status !== this.paymentMethodSelected()?.status) {
        this.setStatus(paymentMethod);
      } else {
        this.updatePaymentMethod(paymentMethod);
      }
    } else {
      this.createPaymentMethod(paymentMethod);
    }
  }

  clearPaymentMethodSelected(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    if (target.closest('button, input, select, textarea, label, a, tr, dialog')) {
      return;
    }

    this.clearForm();
  }
}
