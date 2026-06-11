import { Component, effect, inject, input, model, output } from '@angular/core';
import { DateRangePopoverComponent } from '../date-range-popover.component/date-range-popover.component';
import { AuthStore } from '../../../core/store/auth-store';
import { OfficeStore } from '../../store/office-store';
import { EmployeeStore } from '../../store/employee-store';

@Component({
  selector: 'app-filters',
  imports: [DateRangePopoverComponent],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css',
})
export class FiltersComponent {
  size = input<'sm' | 'md' | 'lg'>('sm');

  officeId = model<number>();
  nameOffice = output<string>();
  employeeId = model<number>();
  nameEmployee = output<string>();
  pageSize = model<number>(10);

  startDate = model<string>();
  endDate = model<string>();

  authStore = inject(AuthStore);
  officeStore = inject(OfficeStore);
  employeeStore = inject(EmployeeStore);

  constructor() {
    effect(() => {
      this.employeeStore.loadEmployees(this.officeId() ?? 0);
    });
  }

  changeOffice(event: Event) {
    const officeValue = Number((event.target as HTMLSelectElement).value);
    this.officeId.set(officeValue);
    this.nameOffice.emit(this.officeStore.offices().find((o) => o.id === officeValue)?.name ?? '');
  }

  changeEmployee(event: Event) {
    const employeeValue = Number((event.target as HTMLSelectElement).value);
    this.employeeId.set(employeeValue);
    this.nameEmployee.emit(
      this.employeeStore.employees().find((e) => e.id === employeeValue)?.name ?? '',
    );
  }
  changeItemsPerPage(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    const itemsPerPage = value > 0 ? value : this.pageSize();
    this.pageSize.set(itemsPerPage);
  }
  changeStartDate(date: string) {
    this.startDate.set(date);
  }

  changeEndDate(date: string) {
    this.endDate.set(date);
  }
}
