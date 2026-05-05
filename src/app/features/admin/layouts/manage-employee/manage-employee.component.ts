import { Component, inject, input, output, effect, signal, computed } from '@angular/core';
import {
  EmployeeAction,
  EmployeeResponse,
  UpdateEmployeeRequest,
} from '../../../../shared/interfaces/employee.interface';

import { finalize } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../../shared/services/employee.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { OfficeStore } from '../../../../shared/store/office-store';
import { AuthStore } from '../../../../core/store/auth-store';

@Component({
  selector: 'app-manage-employee',
  imports: [ReactiveFormsModule],
  templateUrl: './manage-employee.component.html',
})
export class ManageEmployeeComponent {
  officeStore = inject(OfficeStore);
  employeeService = inject(EmployeeService);
  toastService = inject(ToastService);
  authStore = inject(AuthStore);

  selectedEmployee = input<EmployeeResponse | null>(null);
  currentAction = input<EmployeeAction | null>(null);
  refresh = output<void>();
  employeeChanged = output<EmployeeResponse>();
  loadingModal = output<boolean>();

  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  understandAction = signal<boolean>(false);
  sameUser = computed(() => this.selectedEmployee()?.id === this.authStore.employee()?.id);

  constructor() {
    effect(() => {
      if (this.currentAction() === EmployeeAction.EDIT_INFO) {
        this.employeeForm.get('document')?.disable();
      } else {
        this.employeeForm.get('document')?.enable();
      }
    });
    effect(() => {
      if (this.sameUser()) {
        this.employeeForm.get('role')?.disable();
      } else {
        this.employeeForm.get('role')?.enable();
      }
    });
    effect(() => {
      this.employeeForm.reset({
        document: this.selectedEmployee()?.document ?? '',
        email: this.selectedEmployee()?.email ?? '',
        name: this.selectedEmployee()?.name ?? '',
        phone: this.selectedEmployee()?.phone ?? '',
        officeId: this.selectedEmployee()?.officeId ?? 0,
        role: this.selectedEmployee()?.role ?? 'CASHIER',
        status: this.selectedEmployee()?.status ?? true,
      });
    });
    effect(() => {
      if (
        this.currentAction() === EmployeeAction.EDIT_INFO ||
        this.currentAction() === EmployeeAction.STATUS_TOGGLE
      ) {
        const passwordControl = this.employeeForm.get('password');
        passwordControl?.clearValidators();
        passwordControl?.disable();
        passwordControl?.updateValueAndValidity();
      } else {
        const passwordControl = this.employeeForm.get('password');
        passwordControl?.setValidators([Validators.required, Validators.minLength(8)]);
        passwordControl?.enable();
        passwordControl?.updateValueAndValidity();
      }
    });
  }
  employeeForm = new FormGroup({
    document: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(7), Validators.pattern(/^\d+$/)],
    }),
    officeId: new FormControl<number>(1, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    role: new FormControl<'ADMIN' | 'CASHIER'>('CASHIER', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    status: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
  });

  understandToggleStatus(event: Event) {
    this.understandAction.set((event.target as HTMLInputElement).checked);
  }

  closeEmployeeModal() {
    this.understandAction.set(false);
    this.showPassword.set(false);
  }

  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }

  #updateEmployeeInfo() {
    const formValue = this.employeeForm.getRawValue();
    const payload: UpdateEmployeeRequest = {};

    if (formValue.email.trim() !== this.selectedEmployee()?.email) {
      payload.email = formValue.email.trim();
    }
    if (formValue.name !== this.selectedEmployee()?.name) {
      payload.name = formValue.name.trim();
    }
    if (formValue.phone.trim() !== this.selectedEmployee()?.phone) {
      payload.phone = formValue.phone.trim();
    }
    if (
      Number(formValue.officeId) !== this.selectedEmployee()?.officeId &&
      formValue.officeId !== 0
    ) {
      payload.officeId = Number(formValue.officeId);
    }
    if (formValue.role !== this.selectedEmployee()?.role) {
      payload.role = formValue.role;
    }

    this.employeeService
      .updateEmployee(this.selectedEmployee()!.id, payload)
      .pipe(
        finalize(() => {
          this.loadingModal.emit(false);
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show({
            title: 'Empleado actualizado',
            content: `La informacion del empleado ${this.selectedEmployee()?.name} fue actualizada correctamente.`,
            type: 'success',
          });
          const selectedEmployee = this.selectedEmployee();
          if (selectedEmployee) {
            const updatedEmployee: EmployeeResponse = {
              ...selectedEmployee,
              ...payload,
            };
            this.employeeChanged.emit(updatedEmployee);
          }

          if (this.sameUser()) {
            this.authStore.checkSession();
          }
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: 'No se pudo actualizar el empleado.',
            type: 'error',
          });
        },
      });
  }
  #createEmployee() {
    const { status, ...data } = this.employeeForm.getRawValue();
    this.employeeService
      .createEmployee(data)
      .pipe(
        finalize(() => {
          this.loadingModal.emit(false);
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show({
            title: 'Empleado creado',
            content: 'El empleado fue creado correctamente.',
            type: 'success',
          });
          this.refresh.emit();
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: 'No se pudo crear el empleado.',
            type: 'error',
          });
        },
      });
  }

  #savePasswordOnly() {
    const newPassword = this.employeeForm.getRawValue().password;
    const selectedEmployee = this.selectedEmployee();
    if (!selectedEmployee) {
      this.toastService.show({
        title: 'Error',
        content: 'No se ha seleeccionado un empleado.',
        type: 'error',
      });
      return;
    }
    this.employeeService
      .updateEmployeePassword(selectedEmployee.id, newPassword)
      .pipe(
        finalize(() => {
          this.loadingModal.emit(false);
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show({
            title: 'Contraseña actualizada',
            content: `La contraseña del empleado ${this.selectedEmployee()?.name} fue cambiada correctamente.`,
            type: 'success',
          });
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: 'No se pudo actualizar la contraseña.',
            type: 'error',
          });
        },
      });
  }

  #toggleStatus() {
    const selectedEmployee = this.selectedEmployee();
    if (!selectedEmployee) {
      this.toastService.show({
        title: 'Error',
        content: 'No se ha seleeccionado un empleado.',
        type: 'error',
      });
      return;
    }
    const action = selectedEmployee.status ? 'desactivado' : 'reactivado';
    if (this.sameUser() && action === 'desactivado') {
      this.toastService.show({
        title: `Error`,
        content: `No se puede desactivar el administrador actual.`,
        type: 'error',
      });
      return;
    }
    this.employeeService
      .setStatus(selectedEmployee.id, !selectedEmployee.status)
      .pipe(
        finalize(() => {
          this.loadingModal.emit(false);
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show({
            title: `Empleado ${action}`,
            content: `El empleado ${this.selectedEmployee()?.name} fue ${action} correctamente.`,
            type: 'success',
          });
          this.employeeChanged.emit({
            ...selectedEmployee,
            status: !selectedEmployee.status,
          });
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: `No se pudo ${action} al empleado.`,
            type: 'error',
          });
        },
      });
  }

  saveEmployee() {
    if (this.employeeForm.invalid && this.currentAction() !== EmployeeAction.STATUS_TOGGLE) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.loadingModal.emit(true);
    this.isLoading.set(true);
    switch (this.currentAction()) {
      case EmployeeAction.CREATE:
        this.#createEmployee();
        break;
      case EmployeeAction.EDIT_INFO:
        this.#updateEmployeeInfo();
        break;
      case EmployeeAction.CHANGE_PASSWORD:
        this.#savePasswordOnly();
        break;
      case EmployeeAction.STATUS_TOGGLE:
        this.#toggleStatus();
        break;
      default:
        this.loadingModal.emit(false);
        this.isLoading.set(false);
        this.toastService.show({
          title: 'Error',
          content: 'Acción no válida.',
          type: 'error',
        });
    }
  }
}
