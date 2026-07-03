import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { OfficeService } from '../../../../shared/services/office.service';
import {
  CreateOfficeRequest,
  OfficeResponse,
} from '../../../../shared/interfaces/office.interface';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import {
  CellContext,
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/angular-table';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-office.component',
  imports: [FlexRenderDirective, ReactiveFormsModule, DatePipe],
  providers: [DatePipe],
  templateUrl: './office.component.html',
})
export class OfficeComponent implements OnInit {
  officeService = inject(OfficeService);
  toastService = inject(ToastService);
  #datePipe = inject(DatePipe);
  #destroyRef = inject(DestroyRef);

  offices = signal<OfficeResponse[]>([]);
  loadingAction = signal<boolean>(false);
  loadingTable = signal<boolean>(false);
  globalFilter = signal<string>('');
  numberPage = signal<number>(1);
  officeExist = signal<boolean>(false);
  officeSelected = signal<OfficeResponse | null>(null);
  currentDate = new Date();

  officeForm = new FormGroup({
    id: new FormControl<number>(0, {
      nonNullable: true,
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[\p{L}\p{N}_ ]+$/u)],
    }),
    address: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9]+$/)],
    }),
    createdAt: new FormControl<string>('', {
      nonNullable: true,
    }),
    status: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
  });

  #formValue = toSignal(this.officeForm.valueChanges, {
    initialValue: this.officeForm.getRawValue(),
  });
  hasChanges = computed(() => {
    const selected = this.officeSelected();
    const formValue = this.#formValue();
    if (selected) {
      return (
        selected.name !== formValue.name ||
        selected.address !== formValue.address ||
        selected.phone !== formValue.phone ||
        selected.status !== formValue.status
      );
    }
    return true;
  });

  constructor() {
    effect(() => {
      if (!this.officeExist()) {
        this.officeForm.get('status')?.disable();
        this.officeForm.get('status')?.setValue(true);
      } else {
        this.officeForm.get('createdAt')?.disable();
        this.officeForm.get('status')?.enable();
      }
    });

    this.officeForm
      .get('status')
      ?.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        if (value) {
          if (this.officeSelected()?.status === true) {
            this.officeForm.get('name')?.enable({ emitEvent: false });
            this.officeForm.get('address')?.enable({ emitEvent: false });
            this.officeForm.get('phone')?.enable({ emitEvent: false });
          }
        } else {
          this.officeForm.get('name')?.disable({ emitEvent: false });
          this.officeForm
            .get('name')
            ?.setValue(this.officeSelected()?.name ?? '', { emitEvent: false });
          this.officeForm.get('address')?.disable({ emitEvent: false });
          this.officeForm
            .get('address')
            ?.setValue(this.officeSelected()?.address ?? '', { emitEvent: false });
          this.officeForm.get('phone')?.disable({ emitEvent: false });
          this.officeForm
            .get('phone')
            ?.setValue(this.officeSelected()?.phone ?? '', { emitEvent: false });
        }
      });
  }

  ngOnInit(): void {
    this.loadOffices();
  }

  loadOffices() {
    this.loadingTable.set(true);
    this.globalFilter.set('');
    this.officeService
      .getOffices()
      .pipe(finalize(() => this.loadingTable.set(false)))
      .subscribe({
        next: (response) => {
          this.offices.set(response);
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: 'Error al cargar las sucursales',
            type: 'error',
          });
        },
      });
  }
  table = createAngularTable(() => ({
    data: this.offices(),
    columns: [
      {
        header: 'Nombre',
        accessorKey: 'name',
        id: 'name',
      },
      {
        header: 'Direccion',
        accessorKey: 'address',
        id: 'address',
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        id: 'phone',
      },
      {
        header: 'Fecha de creación',
        accessorKey: 'createdAt',
        id: 'createdAt',
        cell: (info: CellContext<OfficeResponse, any>) =>
          this.#datePipe.transform(info.getValue(), 'dd MMM y') || '',
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
    globalFilterFn: (row, _columnId, filterValue) => {
      const filter = String(filterValue).trim().toLowerCase();
      if (!filter) {
        return true;
      }

      const office = row.original;
      const searchableValues = [
        office.id,
        office.name,
        office.address,
        office.phone,
        office.status ? 'activo' : 'inactivo',
      ];

      return searchableValues.some((value) => String(value).toLowerCase().includes(filter));
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

  clearOfficeSelected(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    if (target.closest('button, input, select, textarea, label, a, tr, dialog, [data-exception]')) {
      return;
    }

    this.clearForm();
  }

  onRowClick(office: OfficeResponse) {
    if (office.id === this.officeSelected()?.id) {
      return this.clearForm();
    }
    this.officeExist.set(true);
    this.officeSelected.set(office);
    this.officeForm.setValue({
      id: office.id,
      name: office.name,
      address: office.address,
      phone: office.phone,
      createdAt: office.createdAt,
      status: office.status,
    });
  }

  clearForm() {
    this.officeForm.reset({
      name: '',
      address: '',
      phone: '',
      createdAt: '',
      status: true,
    });
    this.officeSelected.set(null);
    this.officeExist.set(false);
  }

  #setStatus(office: OfficeResponse) {
    this.officeService
      .setStatusOffice(office.id, office.status)
      .pipe(finalize(() => this.loadingAction.set(false)))
      .subscribe({
        next: () => {
          const statusAction = office.status ? 'activar' : 'desactivar';
          this.toastService.show({
            title: `Oficina ${office.name} ${statusAction}`,
            content: `La oficina ha sido ${statusAction} exitosamente.`,
            type: 'success',
          });
          this.offices.update((offices) =>
            offices.map((o) => (o.id === office.id ? { ...o, status: office.status } : o)),
          );
          this.clearForm();
        },
        error: () => {
          const statusAction = office.status ? 'activar' : 'desactivar';
          this.toastService.show({
            title: `Error al ${statusAction} oficina`,
            content: `No se pudo ${statusAction} la oficina. Inténtalo de nuevo.`,
            type: 'error',
          });
        },
      });
  }

  #updateOffice(office: OfficeResponse) {
    const payload: Partial<CreateOfficeRequest> = {};

    if (office.name !== this.officeSelected()?.name) {
      payload['name'] = office.name;
    }
    if (office.address !== this.officeSelected()?.address) {
      payload['address'] = office.address;
    }
    if (office.phone !== this.officeSelected()?.phone) {
      payload['phone'] = office.phone;
    }

    this.officeService
      .updateOffice(office.id, payload as CreateOfficeRequest)
      .pipe(finalize(() => this.loadingAction.set(false)))
      .subscribe({
        next: (response) => {
          this.toastService.show({
            title: 'Oficina actualizada',
            content: `La oficina ${office.name} ha sido actualizada exitosamente.`,
            type: 'success',
          });
          this.offices.update((offices) =>
            offices.map((o) => (o.id === office.id ? { ...o, ...response } : o)),
          );
          this.clearForm();
        },
        error: () => {
          this.toastService.show({
            title: 'Error al actualizar oficina',
            content: 'No se pudo actualizar la oficina. Inténtalo de nuevo.',
            type: 'error',
          });
        },
      });
  }
  #createOffice(office: CreateOfficeRequest) {
    this.officeService
      .createOffice(office)
      .pipe(finalize(() => this.loadingAction.set(false)))
      .subscribe({
        next: () => {
          this.toastService.show({
            title: 'Oficina creada',
            content: 'La oficina ha sido creada exitosamente.',
            type: 'success',
          });
          this.clearForm();
          this.loadOffices();
        },
        error: () => {
          this.toastService.show({
            title: 'Error al crear oficina',
            content: 'No se pudo crear la oficina. Inténtalo de nuevo.',
            type: 'error',
          });
        },
      });
  }

  onSubmit() {
    this.loadingAction.set(true);
    const office = this.officeForm.getRawValue();
    if (this.officeExist()) {
      if (office.status !== this.officeSelected()?.status) {
        this.#setStatus(office);
      } else {
        this.#updateOffice(office);
      }
    } else {
      const { id, createdAt, status, ...officeData } = office;
      this.#createOffice(officeData);
    }
  }
}
