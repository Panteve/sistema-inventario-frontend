import { DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import 'cally';
import { AuthStore } from '../../../../core/store/auth-store';
import { EmployeeStore } from '../../../../shared/store/employee-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import {
  CashRegisterHistory,
  CashRegisterHistoryPagination,
  ParamsGetCashRegisters,
} from '../../../../shared/interfaces/cash-register-interface';
import { ToastService } from '../../../../shared/services/toast.service';
import { CashRegisterService } from '../../services/cash-register.service';
import { OfficeSelectComponent } from '../../../../shared/components/office-select.component/office-select.component';

@Component({
  selector: 'app-cash-register-list',
  standalone: true,
  imports: [DatePipe, CopPipe, OfficeSelectComponent],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cash-register-list.component.html',
})
export class CashRegisterListComponent implements OnInit {
  readonly maxRangeMonths = 3;
  readonly defaultItemsPerPage = 30;
  readonly #filtersStorageKey = 'cashRegisterFilters';

  authStore = inject(AuthStore);
  officeStore = inject(OfficeStore);
  employeeStore = inject(EmployeeStore);
  cashRegisterService = inject(CashRegisterService);
  toastService = inject(ToastService);
  #route = inject(ActivatedRoute);
  #router = inject(Router)

  readonly #today = new Date();
  readonly todayIso = this.#toIsoDate(this.#today);

  cashRegisters = signal<CashRegisterHistory[]>([]);
  pagination = signal<CashRegisterHistoryPagination>({ totalItems: 0, totalPages: 0 });
  loading = signal(false);

  queryParams = signal<ParamsGetCashRegisters>(this.#buildDefaultParams());

  readonly endDateMax = computed(() => {
    if (this.authStore.isAdmin()) {
      return this.todayIso;
    }
    const maxAllowed = this.#addMonthsIso(this.queryParams().startDate, this.maxRangeMonths);
    return maxAllowed > this.todayIso ? this.todayIso : maxAllowed;
  });

  ngOnInit(): void {
    const defaults = this.#buildDefaultParams();
    const savedFilters = this.#loadSavedFilters();
    const params = this.#route.snapshot.queryParamMap;

    const startDate = this.#isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : (savedFilters?.startDate ?? defaults.startDate);
    const endDate = this.#isIsoDate(params.get('endDate'))
      ? params.get('endDate')!
      : (savedFilters?.endDate ?? defaults.endDate);
    const officeIdFromQuery = this.#parseNumber(params.get('officeId'));
    const employeeIdFromQuery = this.#parseNumber(params.get('employeeId'));
    const statusFromQuery = this.#parseStatus(params.get('status'));
    const limitFromQuery = this.#parseNumber(params.get('limit'));
    const pageFromQuery = this.#parseNumber(params.get('page'));

    const nextParams: ParamsGetCashRegisters = {
      ...defaults,
      ...savedFilters,
      startDate,
      endDate,
      officeId: officeIdFromQuery ?? savedFilters?.officeId ?? defaults.officeId,
      employeeId: employeeIdFromQuery ?? savedFilters?.employeeId ?? defaults.employeeId,
      status: statusFromQuery ?? savedFilters?.status ?? defaults.status,
      limit: limitFromQuery ?? savedFilters?.limit ?? defaults.limit,
      page: pageFromQuery ?? savedFilters?.page ?? defaults.page,
    };

    if (!this.authStore.isAdmin()) {
      nextParams.officeId = defaults.officeId;
    }

    this.queryParams.set(this.#normalizeDateRange(nextParams));
    this.#loadEmployeesForOffice();
    this.applyFilters();
  }

  #buildDefaultParams(): ParamsGetCashRegisters {
    const startDate = this.#toIsoDate(this.#subtractMonths(this.#today, this.maxRangeMonths));
    const endDate = this.#toIsoDate(this.#today);
    const officeId = this.authStore.isAdmin() ? undefined : this.authStore.employee()?.officeId;

    return {
      startDate,
      endDate,
      officeId,
      employeeId: undefined,
      status: undefined,
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

  #parseStatus(value: string | null): boolean | undefined {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }

  #normalizeDateRange(params: ParamsGetCashRegisters): ParamsGetCashRegisters {
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

  changeOffice(value: number | undefined) {
    const officeId = value || undefined;
    this.queryParams.update((params) => ({
      ...params,
      officeId,
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

  setStatusFilter(status: boolean | undefined) {
    this.queryParams.update((params) => ({
      ...params,
      status,
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
    this.cashRegisterService
      .getAllCashRegisters(this.queryParams())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.cashRegisters.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: 'Error al obtener los registros de caja',
            type: 'error',
          });
        },
      });
  }

  #saveFilters(): void {
    try {
      localStorage.setItem(this.#filtersStorageKey, JSON.stringify(this.queryParams()));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }

  #loadSavedFilters(): ParamsGetCashRegisters | null {
    try {
      const raw = localStorage.getItem(this.#filtersStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<ParamsGetCashRegisters>;
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
      const status =
        typeof parsed.status === 'string' ? this.#parseStatus(parsed.status) : parsed.status;

      return {
        ...parsed,
        startDate,
        endDate,
        officeId,
        employeeId,
        status,
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

  openCashRegisterDetail(cashRegisterId: number) {
    this.#router.navigate(['..', 'cash-register', cashRegisterId], {relativeTo: this.#route});
  }

}
