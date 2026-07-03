import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../../../core/store/auth-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import {
  BillsHistoryPagination,
  BillsHistoryResponse,
  ParamsGetBills,
} from '../../../../shared/interfaces/bill.interface';
import { ToastService } from '../../../../shared/services/toast.service';
import { BillService } from '../../services/bill.service';
import { FiltersComponent } from '../../../../shared/components/filters.component/filters.component';
import {
  isIsoDate,
  maxRangeMonths,
  normalizeDateRange,
  parseNumber,
  subtractMonths,
  toIsoDate,
} from '../../../../shared/utils/filter-query.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bill-list.component',
  imports: [DatePipe, CopPipe, FiltersComponent],
  providers: [DatePipe],
  templateUrl: './bill-list.component.html',
})
export class BillListComponent implements OnInit {
  readonly defaultItemsPerPage = 30;
  readonly #filtersStorageKey = 'billFilters';

  authStore = inject(AuthStore);
  billService = inject(BillService);
  toastService = inject(ToastService);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  readonly #today = new Date();
  readonly todayIso = toIsoDate(this.#today);

  bills = signal<BillsHistoryResponse[]>([]);
  pagination = signal<BillsHistoryPagination>({ totalItems: 0, totalPages: 0 });
  loading = signal(false);

  queryParams = signal<ParamsGetBills>(this.#buildDefaultParams());

  ngOnInit(): void {
    // Priority: URL filters > saved filters > defaults.
    const defaults = this.#buildDefaultParams();
    const params = this.#route.snapshot.queryParamMap;
    const hasNonDateParams = ['officeId', 'employeeId', 'customerKeyword', 'page', 'limit'].some(
      (key) => params.has(key),
    );
    const savedFilters = hasNonDateParams ? null : this.#loadSavedFilters();
    const sourceParams = savedFilters ?? defaults;

    const startDate = isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : sourceParams.startDate;
    const endDate = isIsoDate(params.get('endDate'))
      ? params.get('endDate')!
      : sourceParams.endDate;
    const officeIdFromQuery = parseNumber(params.get('officeId')) ?? sourceParams.officeId;
    const employeeId = parseNumber(params.get('employeeId')) ?? sourceParams.employeeId;
    const limit = parseNumber(params.get('limit')) ?? sourceParams.limit;
    const page = parseNumber(params.get('page')) ?? sourceParams.page;
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
    this.queryParams.set(
      normalizeDateRange(nextParams, this.todayIso, this.authStore.isAdmin()),
    );
    this.applyFilters();
  }

  #buildDefaultParams(): ParamsGetBills {
    const startDate = toIsoDate(subtractMonths(this.#today, maxRangeMonths));
    const endDate = toIsoDate(this.#today);
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

  changeCustomerKeyword(event: Event) {
    const customerKeyword = (event.target as HTMLInputElement).value.trim();
    this.queryParams.update((params) => ({
      ...params,
      customerKeyword: customerKeyword || undefined,
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
    this.#router.navigate(['..', 'bill', billId], {
      relativeTo: this.#route,
      queryParams: { from: '/view-bills/list' },
    });
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
