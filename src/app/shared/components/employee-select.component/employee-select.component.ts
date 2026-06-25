import { Component, effect, inject, input, output } from '@angular/core';
import { EmployeeStore } from '../../store/employee-store';

@Component({
  selector: 'app-employee-select',
  imports: [],
  templateUrl: './employee-select.component.html',
})
export class EmployeeSelectComponent {
  value = input<number>();
  size = input<string>();
  idEmployee = output<number>();
  nameEmployee = output<string>();
  idOffice = input<number | undefined>(0);

  employeeStore = inject(EmployeeStore);

  constructor() {
    effect(() => {
      this.employeeStore.changeSelectedOffice(this.idOffice() ?? 0);
    })
  }
  changeEmployee(event: Event) {
    const employeeValue = Number((event.target as HTMLSelectElement).value);
    this.idEmployee.emit(employeeValue);
    this.nameEmployee.emit(this.employeeStore.employeesByOffice().find((e) => e.id === employeeValue)?.name ?? '');
  }
}
