import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InventoryMovement, ParamsGetInventoryMovements } from '../../../../shared/interfaces/inventoryMovement.interface';
import { MovementInventoryStore } from '../../store/movement-inventory-store';
import { ActivatedRoute, Router } from '@angular/router';
import 'cally';
import { AuthStore } from '../../../../core/store/auth-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { EmployeeStore } from '../../../../shared/store/employee-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ViewMovementComponent } from '../../layouts/view-movement/view-movement.component';

@Component({
  selector: 'app-movement-list.component',
  imports: [DatePipe, ViewMovementComponent],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './movement-list.component.html',
})
export class MovementListComponent implements OnInit {
  readonly maxRangeMonths = 3;
  readonly defaultItemsPerPage = 20;

  authStore = inject(AuthStore);
  officeStore = inject(OfficeStore);
  employeeStore = inject(EmployeeStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  movementInventoryStore = inject(MovementInventoryStore);

  private readonly today = new Date();
  readonly todayIso = this.toIsoDate(this.today);
  queryParams = signal<ParamsGetInventoryMovements>({
    startDate: this.toIsoDate(this.subtractMonths(this.today, this.maxRangeMonths)),
    endDate: this.toIsoDate(this.today),
    type: undefined as 'IN' | 'OUT' | 'TRANSFER' | undefined,
    fromOfficeId: undefined as number | undefined,
    toOfficeId: undefined as number | undefined,
    employeeId: undefined as number | undefined,
    limit: this.defaultItemsPerPage,
    page: 1,
  });
  movementSelected = signal<InventoryMovement | null>(null);
  readonly endDateMax = computed(() => {
    const maxAllowed = this.addMonthsIso(this.queryParams().startDate, this.maxRangeMonths);
    return maxAllowed > this.todayIso ? this.todayIso : maxAllowed;
  });

  filterPanelSticky = signal(false);
  viewModalOpen = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('viewModal') === 'open')),
    { initialValue: false },
  );
  readonly groupedMovements = computed(() => {
    const todayMovements: InventoryMovement[] = [];
    const olderMovements: InventoryMovement[] = [];
    for (const movement of this.movementInventoryStore.movementList()) {
      if (this.isMovementFromToday(movement.createdAt)) {
        todayMovements.push(movement);
      } else {
        olderMovements.push(movement);
      }
    }
    return {
      todayMovements,
      olderMovements,
      hasTodayMovements: todayMovements.length > 0,
      hasOtherMovements: olderMovements.length > 0,
      hasAnyMovements: todayMovements.length + olderMovements.length > 0,
    };
  });

  ngOnInit(): void {
    this.employeeStore.loadEmployees(0);
    this.applyFilters();
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private subtractMonths(date: Date, months: number): Date {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() - months);
    return copy;
  }

  private addMonthsIso(isoDate: string, months: number): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setMonth(date.getMonth() + months);
    return this.toIsoDate(date);
  }

  private isMovementFromToday(createdAt: string): boolean {
    return this.toIsoDate(new Date(createdAt)) === this.todayIso;
  }

  changeTypeFilter(type: 'IN' | 'OUT' | 'TRANSFER' | undefined) {
    this.queryParams.update((params) => ({
      ...params,
      type,
    }));
  }
  changeStartDate(date: Event) {
    const startDate = (date.target as HTMLInputElement).value;
    this.queryParams.update((params) => ({
      ...params,
      startDate,
    }));

    const maxEndDate = this.endDateMax();
    const currentEndDate = this.queryParams().endDate;
    let nextEndDate = currentEndDate;

    if (currentEndDate < startDate) {
      nextEndDate = startDate;
    }

    if (nextEndDate > maxEndDate) {
      nextEndDate = maxEndDate;
    }

    if (nextEndDate !== currentEndDate) {
      this.queryParams.update((params) => ({
        ...params,
        endDate: nextEndDate,
      }));
    }
  }
  changeEndDate(date: Event) {
    const endDate = (date.target as HTMLInputElement).value;
    this.queryParams.update((params) => ({
      ...params,
      endDate,
    }));
  }
  changeOffice(event: Event) {
    const officeValue = Number((event.target as HTMLSelectElement).value);
    const officeId = officeValue || undefined;
    this.queryParams.update((params) => ({
      ...params,
      fromOfficeId: officeId,
      toOfficeId: officeId,
    }));
    this.employeeStore.loadEmployees(officeId ?? 0);
  }
  changeEmployee(event: Event) {
    const employeeId = Number((event.target as HTMLSelectElement).value);
    this.queryParams.update((params) => ({
      ...params,
      employeeId: employeeId || undefined,
    }));
  }
  changeItemsPerPage(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    const itemsPerPage = value > 0 ? value : this.defaultItemsPerPage;
    this.queryParams.update((params) => ({
      ...params,
      limit: itemsPerPage,
    }));
  }
  changePage(value: number) {
    const page = this.queryParams().page + value;
    if (page < 1 || page > this.movementInventoryStore.pagination().totalPages) {
      return;
    }
    this.queryParams.update((params) => ({
      ...params,
      page,
    }));
    this.applyFilters();
  }

  toggleFilterPanelSticky() {
    this.filterPanelSticky.update((sticky) => !sticky);
  }

  clearFilters() {
    const defaultStartDate = this.toIsoDate(this.subtractMonths(this.today, this.maxRangeMonths));
    const defaultEndDate = this.todayIso;

    this.queryParams.set({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      type: undefined,
      fromOfficeId: undefined,
      toOfficeId: undefined,
      employeeId: undefined,
      limit: this.defaultItemsPerPage,
      page: 1,
    });
    this.employeeStore.loadEmployees(0);
  }

  applyFilters() {
    this.movementInventoryStore.getInventoyryMovements(this.queryParams());
  }

  setMovementSelected(movement: InventoryMovement) {
    this.movementSelected.set(movement);
  }

  openViewModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { viewModal: 'open' },
      queryParamsHandling: 'merge',
    });
  }

  closeViewModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { viewModal: null },
      queryParamsHandling: 'merge',
    });
    this.movementSelected.set(null);
  }
}
