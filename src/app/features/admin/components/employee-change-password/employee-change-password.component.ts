import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeResponse } from '../../../../shared/interfaces/employee.interface';
import { EmployeeService } from '../../../../shared/services/employee.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { finalize } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-employee-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-change-password.component.html',
})
export class EmployeeChangePasswordComponent {
  employeeService = inject(EmployeeService);
  toastService = inject(ToastService);

  selectedEmployee = input.required<EmployeeResponse>();
  loadingModal = output<boolean>();
  close = output<void>();

  isLoading = signal(false);
  showPassword = signal(false);

  passwordForm = new FormGroup({
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  save() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.loadingModal.emit(true);
    this.isLoading.set(true);
    const newPassword = this.passwordForm.getRawValue().password;
    const employee = this.selectedEmployee();

    this.employeeService
      .updateEmployeePassword(employee.id, newPassword)
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
            content: `La contraseña del empleado ${employee.name} fue cambiada correctamente.`,
            type: 'success',
          });
          this.close.emit();
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
}
