import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
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
import { FiltersComponent } from '../../../../shared/components/filters.component/filters.component';
import {
  isIsoDate,
  maxRangeMonths,
  normalizeDateRange,
  parseNumber,
  parseStatus,
  subtractMonths,
  toIsoDate,
} from '../../../../shared/utils/filter-query.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cash-register-list',
  standalone: true,
  imports: [DatePipe, CopPipe, FiltersComponent],
  providers: [DatePipe],
  templateUrl: './cash-register-list.component.html',
})
export class CashRegisterListComponent implements OnInit {
  readonly defaultItemsPerPage = 30;
  readonly #filtersStorageKey = 'cashRegisterFilters';

  authStore = inject(AuthStore);
  officeStore = inject(OfficeStore);
  employeeStore = inject(EmployeeStore);
  cashRegisterService = inject(CashRegisterService);
  toastService = inject(ToastService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  readonly #today = new Date();
  readonly todayIso = toIsoDate(this.#today);

  cashRegisters = signal<CashRegisterHistory[]>([]);
  pagination = signal<CashRegisterHistoryPagination>({ totalItems: 0, totalPages: 0 });
  loading = signal(false);

  queryParams = signal<ParamsGetCashRegisters>(this.#buildDefaultParams());

  ngOnInit(): void {
    const defaults = this.#buildDefaultParams();
    const savedFilters = this.#loadSavedFilters();
    const params = this.#route.snapshot.queryParamMap;

    const startDate = isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : (savedFilters?.startDate ?? defaults.startDate);
    const endDate = isIsoDate(params.get('endDate'))
      ? params.get('endDate')!
      : (savedFilters?.endDate ?? defaults.endDate);
    const officeIdFromQuery = parseNumber(params.get('officeId'));
    const employeeIdFromQuery = parseNumber(params.get('employeeId'));
    const statusFromQuery = parseStatus(params.get('status'));
    const limitFromQuery = parseNumber(params.get('limit'));
    const pageFromQuery = parseNumber(params.get('page'));

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

    this.queryParams.set(normalizeDateRange(nextParams, this.todayIso, this.authStore.isAdmin()));
    this.applyFilters();
  }

  #buildDefaultParams(): ParamsGetCashRegisters {
    const startDate = toIsoDate(subtractMonths(this.#today, maxRangeMonths));
    const endDate = toIsoDate(this.#today);
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

  setStatusFilter(status: boolean | undefined) {
    this.queryParams.update((params) => ({
      ...params,
      status,
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
        typeof parsed.startDate === 'string' && isIsoDate(parsed.startDate)
          ? parsed.startDate
          : null;
      const endDate =
        typeof parsed.endDate === 'string' && isIsoDate(parsed.endDate) ? parsed.endDate : null;

      if (!startDate || !endDate) {
        return null;
      }

      const officeId =
        typeof parsed.officeId === 'string'
          ? parseNumber(parsed.officeId)
          : (parsed.officeId ?? undefined);
      const employeeId =
        typeof parsed.employeeId === 'string'
          ? parseNumber(parsed.employeeId)
          : (parsed.employeeId ?? undefined);
      const parsedLimit =
        typeof parsed.limit === 'string' ? parseNumber(parsed.limit) : parsed.limit;
      const parsedPage = typeof parsed.page === 'string' ? parseNumber(parsed.page) : parsed.page;
      const limit =
        typeof parsedLimit === 'number' && Number.isFinite(parsedLimit)
          ? parsedLimit
          : this.defaultItemsPerPage;
      const page = typeof parsedPage === 'number' && Number.isFinite(parsedPage) ? parsedPage : 1;
      const status = typeof parsed.status === 'string' ? parseStatus(parsed.status) : parsed.status;

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
    this.#router.navigate(['..', 'cash-register', cashRegisterId], { relativeTo: this.#route });
  }

  isNearZero(difference: number): boolean {
    return Math.abs(difference) <= 50;
  }
}
