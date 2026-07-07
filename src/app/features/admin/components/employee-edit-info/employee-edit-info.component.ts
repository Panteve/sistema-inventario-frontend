import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeResponse, UpdateEmployeeRequest } from '../../../../shared/interfaces/employee.interface';
import { EmployeeService } from '../../../../shared/services/employee.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { OfficeStore } from '../../../../shared/store/office-store';
import { AuthStore } from '../../../../core/store/auth-store';
import { finalize } from 'rxjs';
import { EmployeeStore } from '../../../../shared/store/employee-store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-employee-edit-info',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-edit-info.component.html',
})
export class EmployeeEditInfoComponent {
  officeStore = inject(OfficeStore);
  employeeStore = inject(EmployeeStore);
  employeeService = inject(EmployeeService);
  toastService = inject(ToastService);
  authStore = inject(AuthStore);

  selectedEmployee = input.required<EmployeeResponse>();
  employeeChanged = output<EmployeeResponse>();
  loadingModal = output<boolean>();
  close = output<void>();

  isLoading = signal(false);
  sameUser = computed(() => this.selectedEmployee().id === this.authStore.employee()?.id);

  constructor() {
    effect(() => {
      this.employeeForm.get('document')?.disable();
    });
    effect(() => {
      if (this.sameUser()) {
        this.employeeForm.get('role')?.disable();
      } else {
        this.employeeForm.get('role')?.enable();
      }
    });
    effect(() => {
      const emp = this.selectedEmployee();
      this.employeeForm.reset({
        document: emp.document,
        email: emp.email,
        name: emp.name,
        phone: emp.phone,
        officeId: emp.office?.id ?? 1,
        role: emp.role,
      });
    });
  }

  employeeForm = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    document: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
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
  });

  save() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    this.loadingModal.emit(true);
    this.isLoading.set(true);
    const formValue = this.employeeForm.getRawValue();
    const payload: UpdateEmployeeRequest = {};
    const current = this.selectedEmployee();

    if (formValue.email.trim() !== current.email) {
      payload.email = formValue.email.trim();
    }
    if (formValue.name !== current.name) {
      payload.name = formValue.name.trim();
    }
    if (formValue.phone.trim() !== current.phone) {
      payload.phone = formValue.phone.trim();
    }
    if (Number(formValue.officeId) !== current.office?.id && formValue.officeId !== 0) {
      payload.officeId = Number(formValue.officeId);
    }
    if (formValue.role !== current.role) {
      payload.role = formValue.role;
    }

    this.employeeService
      .updateEmployee(current.id, payload)
      .pipe(
        finalize(() => {
          this.loadingModal.emit(false);
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (updatedEmployee) => {
          this.toastService.show({
            title: 'Empleado actualizado',
            content: `La información del empleado ${current.name} fue actualizada correctamente.`,
            type: 'success',
          });
          if (this.sameUser()) {
            this.authStore.checkSession();
          }
          this.employeeStore.updateEmployee(updatedEmployee.id, {
            name: updatedEmployee.name,
            office: {
              id: updatedEmployee.office?.id ?? 0,
            },
          });
          this.employeeChanged.emit(updatedEmployee);
          this.close.emit();
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
}
