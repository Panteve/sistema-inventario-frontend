import { DatePipe } from '@angular/common';
import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import 'cally';
import { AuthStore } from '../../../../core/store/auth-store';
import { EmployeeStore } from '../../../../shared/store/employee-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import {
  BillsHistoryPagination,
  BillsHistoryResponse,
  ParamsGetBills,
} from '../../../../shared/interfaces/bill.interface';
import { ToastService } from '../../../../shared/services/toast.service';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-bill-list.component',
  imports: [DatePipe, CopPipe],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bill-list.component.html',
})
export class BillListComponent implements OnInit {
  readonly maxRangeMonths = 3;
  readonly defaultItemsPerPage = 30;
  readonly #filtersStorageKey = 'billFilters';

  authStore = inject(AuthStore);
  officeStore = inject(OfficeStore);
  employeeStore = inject(EmployeeStore);
  billService = inject(BillService);
  toastService = inject(ToastService);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  readonly #today = new Date();
  readonly todayIso = this.#toIsoDate(this.#today);

  bills = signal<BillsHistoryResponse[]>([]);
  pagination = signal<BillsHistoryPagination>({ totalItems: 0, totalPages: 0 });
  loading = signal(false);

  queryParams = signal<ParamsGetBills>(this.#buildDefaultParams());

  readonly endDateMax = computed(() => {
    if (this.authStore.isAdmin()) {
      return this.todayIso;
    }
    const maxAllowed = this.#addMonthsIso(this.queryParams().startDate, this.maxRangeMonths);
    return maxAllowed > this.todayIso ? this.todayIso : maxAllowed;
  });

  ngOnInit(): void {
    // Priority: URL filters > saved filters > defaults.
    const defaults = this.#buildDefaultParams();
    const params = this.#route.snapshot.queryParamMap;
    const hasNonDateParams = ['officeId', 'employeeId', 'customerKeyword', 'page', 'limit'].some(
      (key) => params.has(key),
    );
    const savedFilters = hasNonDateParams ? null : this.#loadSavedFilters();
    const sourceParams = savedFilters ?? defaults;

    const startDate = this.#isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : sourceParams.startDate;
    const endDate = this.#isIsoDate(params.get('endDate'))
      ? params.get('endDate')!
      : sourceParams.endDate;
    const officeIdFromQuery = this.#parseNumber(params.get('officeId')) ?? sourceParams.officeId;
    const employeeId = this.#parseNumber(params.get('employeeId')) ?? sourceParams.employeeId;
    const limit = this.#parseNumber(params.get('limit')) ?? sourceParams.limit;
    const page = this.#parseNumber(params.get('page')) ?? sourceParams.page;
    const customerKeyword = params.get('customerKeyword')?.trim() ?? sourceParams.customerKeyword;
    const officeId = this.authStore.isAdmin() ? officeIdFromQuery : defaults.officeId;
    const nextParams: ParamsGetBills = {
      ...defaults,
      startDate,
      endDate,
      officeId,
      employeeId,
      customerKeyword,
      limit,
      page,
    };
    this.queryParams.set(this.#normalizeDateRange(nextParams));
    this.#loadEmployeesForOffice();
    this.applyFilters();
  }

  #buildDefaultParams(): ParamsGetBills {
    const startDate = this.#toIsoDate(this.#subtractMonths(this.#today, this.maxRangeMonths));
    const endDate = this.#toIsoDate(this.#today);
    const officeId = this.authStore.isAdmin() ? undefined : this.authStore.employee()?.officeId;

    return {
      startDate,
      endDate,
      officeId,
      employeeId: undefined,
      customerKeyword: undefined,
      limit: this.defaultItemsPerPage,
      page: 1,
    };
  }

  #loadEmployeesForOffice(): void {
    const officeId = this.queryParams().officeId ?? 0;
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

  #normalizeDateRange(params: ParamsGetBills): ParamsGetBills {
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

  changeStartDate(event: Event) {
    const startDate = (event.target as HTMLInputElement).value;
    this.queryParams.update((params) =>
      this.#normalizeDateRange({
        ...params,
        startDate,
        page: 1,
      }),
    );
  }

  changeEndDate(event: Event) {
    const endDate = (event.target as HTMLInputElement).value;
    this.queryParams.update((params) =>
      this.#normalizeDateRange({
        ...params,
        endDate,
        page: 1,
      }),
    );
  }

  changeOffice(event: Event) {
    const officeValue = Number((event.target as HTMLSelectElement).value);
    const officeId = officeValue || undefined;
    this.queryParams.update((params) => ({
      ...params,
      officeId,
      employeeId: undefined,
      page: 1,
    }));
    this.employeeStore.loadEmployees(officeId ?? 0);
  }

  changeEmployee(event: Event) {
    const employeeId = Number((event.target as HTMLSelectElement).value);
    this.queryParams.update((params) => ({
      ...params,
      employeeId: employeeId || undefined,
      page: 1,
    }));
  }

  changeCustomerKeyword(event: Event) {
    const customerKeyword = (event.target as HTMLInputElement).value.trim();
    this.queryParams.update((params) => ({
      ...params,
      customerKeyword: customerKeyword || undefined,
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
    const nextPage = this.queryParams().page + value;
    const totalPages = this.pagination().totalPages || 1;
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    this.queryParams.update((params) => ({
      ...params,
      page: nextPage,
    }));
    this.applyFilters();
  }

  clearFilters() {
    this.queryParams.set(this.#buildDefaultParams());
    this.#loadEmployeesForOffice();
    this.#clearSavedFilters();
    this.applyFilters();
  }

  applyFilters() {
    this.#saveFilters();
    this.loading.set(true);
    this.billService
      .getBills(this.queryParams())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.bills.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: 'Error al obtener las facturas',
            type: 'error',
          });
        },
      });
  }

  openBillDetail(billId: number) {
    this.#router.navigate(['..', 'bill', billId], {relativeTo: this.#route});
  }

  #saveFilters(): void {
    try {
      localStorage.setItem(this.#filtersStorageKey, JSON.stringify(this.queryParams()));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }

  #loadSavedFilters(): ParamsGetBills | null {
    try {
      const raw = localStorage.getItem(this.#filtersStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<ParamsGetBills>;
      const startDate =
        typeof parsed.startDate === 'string' && this.#isIsoDate(parsed.startDate)
          ? parsed.startDate
          : null;
      const endDate =
        typeof parsed.endDate === 'string' && this.#isIsoDate(parsed.endDate)
          ? parsed.endDate
          : null;

      if (!startDate || !endDate) {
        return null;
      }

      const officeId =
        typeof parsed.officeId === 'string'
          ? this.#parseNumber(parsed.officeId)
          : (parsed.officeId ?? undefined);
      const employeeId =
        typeof parsed.employeeId === 'string'
          ? this.#parseNumber(parsed.employeeId)
          : (parsed.employeeId ?? undefined);
      const parsedLimit =
        typeof parsed.limit === 'string' ? this.#parseNumber(parsed.limit) : parsed.limit;
      const parsedPage =
        typeof parsed.page === 'string' ? this.#parseNumber(parsed.page) : parsed.page;
      const limit =
        typeof parsedLimit === 'number' && Number.isFinite(parsedLimit)
          ? parsedLimit
          : this.defaultItemsPerPage;
      const page = typeof parsedPage === 'number' && Number.isFinite(parsedPage) ? parsedPage : 1;

      return {
        ...parsed,
        startDate,
        endDate,
        officeId,
        employeeId,
        limit,
        page,
      };
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error);
      return null;
    }
  }

  #clearSavedFilters(): void {
    try {
      localStorage.removeItem(this.#filtersStorageKey);
    } catch (error) {
      console.error('Failed to clear filters from localStorage:', error);
    }
  }
}
