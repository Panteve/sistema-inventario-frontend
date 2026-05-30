import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
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
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ViewMovementComponent } from '../../layouts/view-movement/view-movement.component';
import { OfficeSelectComponent } from '../../../../shared/components/office-select.component/office-select.component';

@Component({
  selector: 'app-movement-list.component',
  imports: [DatePipe, ViewMovementComponent, OfficeSelectComponent],
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
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  movementInventoryStore = inject(MovementInventoryStore);

  readonly #today = new Date();
  readonly todayIso = this.#toIsoDate(this.#today);
  queryParams = signal<ParamsGetInventoryMovements>(this.#buildDefaultParams());
  movementSelected = signal<InventoryMovement | null>(null);
  readonly endDateMax = computed(() => {
    if (this.authStore.isAdmin()) {
      return this.todayIso;
    }
    const maxAllowed = this.#addMonthsIso(this.queryParams().startDate, this.maxRangeMonths);
    return maxAllowed > this.todayIso ? this.todayIso : maxAllowed;
  });

  filterPanelSticky = signal(false);
  viewModalOpen = toSignal(
    this.#route.queryParamMap.pipe(map((params) => params.get('viewModal') === 'open')),
    { initialValue: false },
  );
  readonly groupedMovements = computed(() => {
    const todayMovements: InventoryMovement[] = [];
    const olderMovements: InventoryMovement[] = [];
    for (const movement of this.movementInventoryStore.movementList()) {
      if (this.#isMovementFromToday(movement.createdAt)) {
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
    // Priority: URL (deep links) > defaults.
    const defaults = this.#buildDefaultParams();
    const params = this.#route.snapshot.queryParamMap;
    const hasNonDateParams = [
      'type',
      'fromOfficeId',
      'toOfficeId',
      'employeeId',
      'page',
      'limit',
    ].some((key) => params.has(key));
    const startDate = this.#isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : defaults.startDate;
    const endDate = this.#isIsoDate(params.get('endDate'))
      ? params.get('endDate')!
      : defaults.endDate;
    const type = hasNonDateParams ? this.#parseMovementType(params.get('type')) : defaults.type;
    const fromOfficeIdFromQuery = this.#parseNumber(params.get('fromOfficeId'));
    const toOfficeIdFromQuery = this.#parseNumber(params.get('toOfficeId'));
    const employeeId = hasNonDateParams
      ? this.#parseNumber(params.get('employeeId'))
      : defaults.employeeId;
    const limitFromQuery = this.#parseNumber(params.get('limit'));
    const pageFromQuery = this.#parseNumber(params.get('page'));
    const limit = limitFromQuery && limitFromQuery > 0 ? limitFromQuery : defaults.limit;
    const page = pageFromQuery && pageFromQuery > 0 ? pageFromQuery : defaults.page;

    const officeIdFromParams = fromOfficeIdFromQuery ?? toOfficeIdFromQuery;
    const officeId = hasNonDateParams
      ? officeIdFromParams
      : (officeIdFromParams ?? defaults.fromOfficeId);
    const resolvedOfficeId = this.authStore.isAdmin() ? officeId : defaults.fromOfficeId;
    const nextParams: ParamsGetInventoryMovements = {
      ...defaults,
      startDate,
      endDate,
      type,
      fromOfficeId: resolvedOfficeId,
      toOfficeId: resolvedOfficeId,
      employeeId,
      limit,
      page,
    };
    this.queryParams.set(this.#normalizeDateRange(nextParams));
    this.#loadEmployeesForOffice();
    this.applyFilters();
  }

  #buildDefaultParams(): ParamsGetInventoryMovements {
    const startDate = this.#toIsoDate(this.#subtractMonths(this.#today, this.maxRangeMonths));
    const endDate = this.#toIsoDate(this.#today);
    const officeId = this.authStore.isAdmin() ? undefined : this.authStore.employee()?.officeId;

    return {
      startDate,
      endDate,
      type: undefined,
      fromOfficeId: officeId,
      toOfficeId: officeId,
      employeeId: undefined,
      limit: this.defaultItemsPerPage,
      page: 1,
    };
  }

   #loadEmployeesForOffice(): void {
    const officeId = this.queryParams().fromOfficeId ?? 0;
    this.employeeStore.loadEmployees(officeId);
  }

   #isIsoDate(value: string | null): value is string {
    return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

   #parseNumber(value: string | null): number | undefined {
    if (value === null || value.trim() === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

   #parseMovementType(value: string | null): 'IN' | 'OUT' | 'TRANSFER' | undefined {
    if (value === 'IN' || value === 'OUT' || value === 'TRANSFER') {
      return value;
    }
    return undefined;
  }

   #normalizeDateRange(params: ParamsGetInventoryMovements): ParamsGetInventoryMovements {
    let { startDate, endDate } = params;

    if (startDate > this.todayIso) {
      startDate = this.todayIso;
    }

    const maxEndDate = this.authStore.isAdmin()
      ? this.todayIso
      : this.#addMonthsIso(startDate, this.maxRangeMonths);
    const cappedMaxEndDate = maxEndDate > this.todayIso ? this.todayIso : maxEndDate;

    if (endDate < startDate) {
      endDate = startDate;
    }
    if (endDate > cappedMaxEndDate) {
      endDate = cappedMaxEndDate;
    }

    return {
      ...params,
      startDate,
      endDate,
    };
  }

  #toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  #subtractMonths(date: Date, months: number): Date {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() - months);
    return copy;
  }

  #addMonthsIso(isoDate: string, months: number): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setMonth(date.getMonth() + months);
    return this.#toIsoDate(date);
  }

  #isMovementFromToday(createdAt: string): boolean {
    return this.#toIsoDate(new Date(createdAt)) === this.todayIso;
  }

  changeTypeFilter(type: 'IN' | 'OUT' | 'TRANSFER' | undefined) {
    this.queryParams.update((params) => ({
      ...params,
      type,
      page: 1,
    }));
  }
  changeStartDate(date: Event) {
    const startDate = (date.target as HTMLInputElement).value;
    this.queryParams.update((params) =>
      this.#normalizeDateRange({
        ...params,
        startDate,
        page: 1,
      }),
    );
  }
  changeEndDate(date: Event) {
    const endDate = (date.target as HTMLInputElement).value;
    this.queryParams.update((params) =>
      this.#normalizeDateRange({
        ...params,
        endDate,
        page: 1,
      }),
    );
  }
  changeOffice(value: number) {
    const officeId = value || undefined;
    this.queryParams.update((params) => ({
      ...params,
      fromOfficeId: officeId,
      toOfficeId: officeId,
      employeeId: undefined,
      page: 1,
    }));
    this.#loadEmployeesForOffice();
  }
  changeEmployee(event: Event) {
    const employeeId = Number((event.target as HTMLSelectElement).value);
    this.queryParams.update((params) => ({
      ...params,
      employeeId: employeeId || undefined,
      page: 1,
    }));
  }
  changeItemsPerPage(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    const itemsPerPage = value > 0 ? value : this.defaultItemsPerPage;
    this.queryParams.update((params) => ({
      ...params,
      limit: itemsPerPage,
      page: 1,
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
    this.queryParams.set(this.#buildDefaultParams());
    this.#loadEmployeesForOffice();
    this.applyFilters();
  }

  applyFilters() {
    this.movementInventoryStore.getInventoyryMovements(this.queryParams());
  }

  setMovementSelected(movement: InventoryMovement) {
    this.movementSelected.set(movement);
  }

  openViewModal() {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { viewModal: 'open' },
      queryParamsHandling: 'merge',
    });
  }

  closeViewModal() {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { viewModal: null },
      queryParamsHandling: 'merge',
    });
    this.movementSelected.set(null);
  }
}
