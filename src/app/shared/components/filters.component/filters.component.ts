import { Component, inject, input, model, output } from '@angular/core';
import { DateRangePopoverComponent } from '../date-range-popover.component/date-range-popover.component';
import { AuthStore } from '../../../core/store/auth-store';
import { EmployeeSelectComponent } from '../employee-select.component/employee-select.component';
import { OfficeSelectComponent } from '../office-select.component/office-select.component';

@Component({
  selector: 'app-filters',
  imports: [DateRangePopoverComponent, EmployeeSelectComponent, OfficeSelectComponent],
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

  changeOfficeId(officeId: number) {
    this.officeId.set(officeId);
  }
  changeOfficeName(officeName: string) {
    this.nameOffice.emit(officeName);
  }

  changeEmployeeId(employeeId: number) {
    this.employeeId.set(employeeId);
  }

  changeEmployeeName(employeeName: string) {
    this.nameEmployee.emit(employeeName);
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
