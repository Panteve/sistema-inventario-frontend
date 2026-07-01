import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../../shared/services/employee.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { OfficeStore } from '../../../../shared/store/office-store';
import { finalize } from 'rxjs';
import { EmployeeResponse } from '../../../../shared/interfaces/employee.interface';

@Component({
  selector: 'app-employee-create',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-create.component.html',
})
export class EmployeeCreateComponent {
  officeStore = inject(OfficeStore);
  employeeService = inject(EmployeeService);
  toastService = inject(ToastService);

  addEmployee = output<EmployeeResponse>();
  loadingModal = output<boolean>();
  close = output<void>();

  isLoading = signal(false);
  showPassword = signal(false);

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
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  save() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    this.loadingModal.emit(true);
    this.isLoading.set(true);
    const data = this.employeeForm.getRawValue();
    this.employeeService
      .createEmployee(data)
      .pipe(
        finalize(() => {
          this.loadingModal.emit(false);
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (employee) => {
          this.toastService.show({
            title: 'Empleado creado',
            content: 'El empleado fue creado correctamente.',
            type: 'success',
          });
          this.addEmployee.emit(employee);
          this.close.emit();
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
}
