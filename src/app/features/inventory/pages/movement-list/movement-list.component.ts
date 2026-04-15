import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import {
  InventoryMovement,
  ParamsGetInventoryMovements,
} from '../../../../shared/interfaces/inventoryMovement.interface';
import { MovementInventoryStore } from '../../store/movement-inventory-store';
import { ActivatedRoute, Router } from '@angular/router';
import 'cally';
import { AuthStore } from '../../../../core/store/auth-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { EmployeeStore } from '../../../../shared/store/employee-store';

@Component({
  selector: 'app-movement-list.component',
  imports: [DatePipe],
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
  router = inject(Router);
  route = inject(ActivatedRoute);
  movementInventoryStore = inject(MovementInventoryStore);
  service = inject(InventoryService);

  private readonly today = new Date();
  readonly todayIso = this.toIsoDate(this.today);
  queryParams = signal({
    startDate: this.toIsoDate(this.subtractMonths(this.today, this.maxRangeMonths)),
    endDate: this.toIsoDate(this.today),
    typeFilter: undefined as 'IN' | 'OUT' | 'TRANSFER' | undefined,
    fromOffice: undefined as number | undefined,
    toOffice: undefined as number | undefined,
    employeeFilter: undefined as number | undefined,
    itemsPerPage: this.defaultItemsPerPage,
    activePage: 1,
  });

  readonly endDateMax = computed(() => {
    const maxAllowed = this.addMonthsIso(this.queryParams().startDate, this.maxRangeMonths);
    return maxAllowed > this.todayIso ? this.todayIso : maxAllowed;
  });

  filterPanelSticky = signal(true);

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

  constructor() {
    this.route.queryParams.subscribe(() => {
      const queryParams = this.route.snapshot.queryParams as ParamsGetInventoryMovements;
      this.movementInventoryStore.getInventoyryMovements(queryParams);
    });
  }
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
      typeFilter: type,
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
      fromOffice: officeId,
      toOffice: officeId,
    }));
    this.employeeStore.loadEmployees(officeId ?? 0);
  }
  changeEmployee(event: Event) {
    const employeeId = Number((event.target as HTMLSelectElement).value);
    this.queryParams.update((params) => ({
      ...params,
      employeeFilter: employeeId || undefined,
    }));
  }
  changeItemsPerPage(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    const itemsPerPage = value > 0 ? value : this.defaultItemsPerPage;
    this.queryParams.update((params) => ({
      ...params,
      itemsPerPage,
    }));
  }
  changePage(value: number) {
    const page = this.queryParams().activePage + value;
    if (page < 1 || page > this.movementInventoryStore.pagination().totalPages) {
      return;
    }
    this.queryParams.update((params) => ({
      ...params,
      activePage: page,
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
      typeFilter: undefined,
      fromOffice: undefined,
      toOffice: undefined,
      employeeFilter: undefined,
      itemsPerPage: this.defaultItemsPerPage,
      activePage: 1,
    });
    this.employeeStore.loadEmployees(0);
    this.router.navigate([], {
      queryParams: {
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        type: null,
        fromOfficeId: null,
        toOfficeId: null,
        employeeId: null,
        limit: this.defaultItemsPerPage,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  applyFilters() {
    console.log('Applying filters with params:', this.queryParams());
    this.router.navigate([], {
      queryParams: {
        startDate: this.queryParams().startDate,
        endDate: this.queryParams().endDate,
        type: this.queryParams().typeFilter,
        fromOfficeId: this.queryParams().fromOffice,
        toOfficeId: this.queryParams().toOffice,
        employeeId: this.queryParams().employeeFilter,
        limit: this.queryParams().itemsPerPage,
        page: this.queryParams().activePage,
      },
      queryParamsHandling: 'merge',
    });
  }
}
