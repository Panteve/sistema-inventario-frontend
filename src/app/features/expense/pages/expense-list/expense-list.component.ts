import { DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map } from 'rxjs';
import { AuthStore } from '../../../../core/store/auth-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';
import {
  Expense,
  ExpensePagination,
  ParamsGetExpenses,
} from '../../../../shared/interfaces/expense.interface';
import { ToastService } from '../../../../shared/services/toast.service';
import { ExpenseService } from '../../service/expense.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ViewExpenseComponent } from '../../layouts/view-expense/view-expense.component';
import { OfficeSelectComponent } from '../../../../shared/components/office-select.component/office-select.component';
import { EmployeeSelectComponent } from '../../../../shared/components/employee-select.component/employee-select.component';
import { DateRangePopoverComponent } from '../../../../shared/components/date-range-popover.component/date-range-popover.component';
import {
  isIsoDate,
  maxRangeMonths,
  normalizeDateRange,
  parseNumber,
  subtractMonths,
  toIsoDate,
} from '../../../../shared/utils/filter-query.utils';
import { FiltersComponent } from '../../../../shared/components/filters.component/filters.component';

@Component({
  selector: 'app-expense-list.component',
  imports: [
    DatePipe,
    CopPipe,
    SlicePipe,
    CopMoneyInputDirective,
    ViewExpenseComponent,
    FiltersComponent,
  ],
  providers: [DatePipe],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
})
export class ExpenseListComponent implements OnInit {
  readonly defaultItemsPerPage = 30;

  authStore = inject(AuthStore);
  expenseService = inject(ExpenseService);
  toastService = inject(ToastService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  readonly #today = new Date();
  readonly todayIso = toIsoDate(this.#today);

  expenses = signal<Expense[]>([]);
  pagination = signal<ExpensePagination>({ totalItems: 0, totalPages: 0 });
  loading = signal(false);
  expenseSelected = signal<Expense | null>(null);

  queryParams = signal<ParamsGetExpenses>(this.#buildDefaultParams());

  viewModalOpen = toSignal(
    this.#route.queryParamMap.pipe(map((params) => params.get('viewModal') === 'open')),
    { initialValue: false },
  );

  ngOnInit(): void {
    const defaults = this.#buildDefaultParams();
    const params = this.#route.snapshot.queryParamMap;

    const startDate = isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : defaults.startDate;
    const endDate = isIsoDate(params.get('endDate')) ? params.get('endDate')! : defaults.endDate;
    const officeIdFromQuery = parseNumber(params.get('officeId')) ?? defaults.officeId;
    const employeeId = parseNumber(params.get('employeeId')) ?? defaults.employeeId;
    const amountMin = parseNumber(params.get('amountMin')) ?? defaults.amountMin;
    const amountMax = parseNumber(params.get('amountMax')) ?? defaults.amountMax;
    const reasonKeywordRaw = params.get('reasonKeyword')?.trim();
    const reasonKeyword = reasonKeywordRaw ? reasonKeywordRaw : defaults.reasonKeyword;
    const orderBy = (params.get('orderBy')?.trim() as 'createdAt' | 'amount') ?? defaults.orderBy;
    const orderDirection =
      (params.get('orderDirection')?.trim() as 'asc' | 'desc') ?? defaults.orderDirection;
    const limit = parseNumber(params.get('limit')) ?? defaults.limit;
    const page = parseNumber(params.get('page')) ?? defaults.page;
    const officeId = this.authStore.isAdmin() ? officeIdFromQuery : defaults.officeId;

    const nextParams: ParamsGetExpenses = {
      ...defaults,
      startDate,
      endDate,
      officeId,
      employeeId,
      amountMin,
      amountMax,
      reasonKeyword,
      orderBy,
      orderDirection,
      limit,
      page,
    };

    this.queryParams.set(normalizeDateRange(nextParams, this.todayIso, this.authStore.isAdmin()));
    this.applyFilters();
  }

  #buildDefaultParams(): ParamsGetExpenses {
    const startDate = toIsoDate(subtractMonths(this.#today, maxRangeMonths));
    const endDate = toIsoDate(this.#today);
    const officeId = this.authStore.isAdmin() ? undefined : this.authStore.employee()?.officeId;

    return {
      startDate,
      endDate,
      officeId,
      employeeId: undefined,
      amountMin: undefined,
      amountMax: undefined,
      reasonKeyword: undefined,
      orderBy: 'createdAt',
      orderDirection: 'desc',
      limit: this.defaultItemsPerPage,
      page: 1,
    };
  }

  #parseMoneyInput(value: string): number | undefined {
    const digits = value.replace(/\D/g, '');
    if (digits === '') return undefined;
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  changeOrderDirection() {
    if (this.queryParams().orderDirection === 'desc') {
      this.queryParams.update((params) => ({
        ...params,
        orderDirection: 'asc',
      }));
    } else {
      this.queryParams.update((params) => ({
        ...params,
        orderDirection: 'desc',
      }));
    }
  }

  changeReasonKeyword(event: Event) {
    const reasonKeyword = (event.target as HTMLInputElement).value.trim();
    this.queryParams.update((params) => ({
      ...params,
      reasonKeyword: reasonKeyword || undefined,
      page: 1,
    }));
  }

  changeAmountMin(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const amountMin = this.#parseMoneyInput(value);
    this.queryParams.update((params) => ({
      ...params,
      amountMin,
      page: 1,
    }));
  }

  changeAmountMax(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const amountMax = this.#parseMoneyInput(value);
    this.queryParams.update((params) => ({
      ...params,
      amountMax,
      page: 1,
    }));
  }

  changeOrderBy(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const orderBy = (value as 'createdAt' | 'amount') ?? 'createdAt';
    this.queryParams.update((params) => ({
      ...params,
      orderBy,
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
    this.applyFilters();
  }

  applyFilters() {
    this.loading.set(true);
    this.expenseService
      .getExpenses(this.queryParams())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.expenses.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: 'Error al obtener los gastos',
            type: 'error',
          });
        },
      });
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
    this.expenseSelected.set(null);
  }
}
