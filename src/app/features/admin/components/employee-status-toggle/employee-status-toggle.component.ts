import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { EmployeeResponse } from '../../../../shared/interfaces/employee.interface';
import { EmployeeService } from '../../../../shared/services/employee.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthStore } from '../../../../core/store/auth-store';
import { finalize } from 'rxjs';
import { EmployeeStore } from '../../../../shared/store/employee-store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-employee-status-toggle',
  imports: [],
  templateUrl: './employee-status-toggle.component.html',
})
export class EmployeeStatusToggleComponent {
  employeeService = inject(EmployeeService);
  employeeStore = inject(EmployeeStore);
  toastService = inject(ToastService);
  authStore = inject(AuthStore);

  selectedEmployee = input.required<EmployeeResponse>();
  employeeChanged = output<EmployeeResponse>();
  loadingModal = output<boolean>();
  close = output<void>();

  isLoading = signal(false);
  understandAction = signal(false);
  sameUser = computed(() => this.selectedEmployee().id === this.authStore.employee()?.id);

  understandToggleStatus(event: Event) {
    this.understandAction.set((event.target as HTMLInputElement).checked);
  }

  save() {
    const employee = this.selectedEmployee();
    const action = employee.status ? 'desactivado' : 'reactivado';

    if (this.sameUser() && action === 'desactivado') {
      this.toastService.show({
        title: 'Error',
        content: 'No se puede desactivar el administrador actual.',
        type: 'error',
      });
      return;
    }

    this.loadingModal.emit(true);
    this.isLoading.set(true);

    this.employeeService
      .setStatus(employee.id, !employee.status)
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
            content: `El empleado ${employee.name} fue ${action} correctamente.`,
            type: 'success',
          });
          this.employeeChanged.emit({ ...employee, status: !employee.status });
          if (employee.status) {
            this.employeeStore.deleteEmployee(employee.id);
          } else {
            this.employeeStore.addEmployee({
              id: employee.id,
              name: employee.name,
              office: { id: employee.office?.id! },
            });
          }
          this.close.emit();
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: `El empleado ${employee.name} no pudo ser ${action}.`,
            type: 'error',
          });
        },
      });
  }
}
