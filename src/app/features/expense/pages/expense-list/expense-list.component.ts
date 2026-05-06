import { DatePipe, SlicePipe } from '@angular/common';
import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map } from 'rxjs';
import 'cally';
import { AuthStore } from '../../../../core/store/auth-store';
import { EmployeeStore } from '../../../../shared/store/employee-store';
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

@Component({
  selector: 'app-expense-list.component',
  imports: [DatePipe, CopPipe, SlicePipe, CopMoneyInputDirective, ViewExpenseComponent],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
})
export class ExpenseListComponent implements OnInit {
  readonly maxRangeMonths = 3;
  readonly defaultItemsPerPage = 30;

  authStore = inject(AuthStore);
  officeStore = inject(OfficeStore);
  employeeStore = inject(EmployeeStore);
  expenseService = inject(ExpenseService);
  toastService = inject(ToastService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  readonly #today = new Date();
  readonly todayIso = this.#toIsoDate(this.#today);

  expenses = signal<Expense[]>([]);
  pagination = signal<ExpensePagination>({ totalItems: 0, totalPages: 0 });
  loading = signal(false);
  expenseSelected = signal<Expense | null>(null);

  queryParams = signal<ParamsGetExpenses>(this.#buildDefaultParams());

  readonly endDateMax = computed(() => {
    if (this.authStore.isAdmin()) {
      return this.todayIso;
    }
    const maxAllowed = this.#addMonthsIso(this.queryParams().startDate, this.maxRangeMonths);
    return maxAllowed > this.todayIso ? this.todayIso : maxAllowed;
  });
  viewModalOpen = toSignal(
    this.#route.queryParamMap.pipe(map((params) => params.get('viewModal') === 'open')),
    { initialValue: false },
  );

  ngOnInit(): void {
    const defaults = this.#buildDefaultParams();
    const params = this.#route.snapshot.queryParamMap;

    const startDate = this.#isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : defaults.startDate;
    const endDate = this.#isIsoDate(params.get('endDate'))
      ? params.get('endDate')!
      : defaults.endDate;
    const officeIdFromQuery = this.#parseNumber(params.get('officeId')) ?? defaults.officeId;
    const employeeId = this.#parseNumber(params.get('employeeId')) ?? defaults.employeeId;
    const amountMin = this.#parseNumber(params.get('amountMin')) ?? defaults.amountMin;
    const amountMax = this.#parseNumber(params.get('amountMax')) ?? defaults.amountMax;
    const reasonKeywordRaw = params.get('reasonKeyword')?.trim();
    const reasonKeyword = reasonKeywordRaw ? reasonKeywordRaw : defaults.reasonKeyword;
    const orderBy = (params.get('orderBy')?.trim() as 'createdAt' | 'amount') ?? defaults.orderBy;
    const orderDirection =
      (params.get('orderDirection')?.trim() as 'asc' | 'desc') ?? defaults.orderDirection;
    const limit = this.#parseNumber(params.get('limit')) ?? defaults.limit;
    const page = this.#parseNumber(params.get('page')) ?? defaults.page;
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

    this.queryParams.set(this.#normalizeDateRange(nextParams));
    this.#loadEmployeesForOffice();
    this.applyFilters();
  }

  #buildDefaultParams(): ParamsGetExpenses {
    const startDate = this.#toIsoDate(this.#subtractMonths(this.#today, this.maxRangeMonths));
    const endDate = this.#toIsoDate(this.#today);
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

  #parseMoneyInput(value: string): number | undefined {
    const digits = value.replace(/\D/g, '');
    if (digits === '') return undefined;
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  #normalizeDateRange(params: ParamsGetExpenses): ParamsGetExpenses {
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

  changeOrderDirection(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const orderDirection = (value as 'asc' | 'desc') ?? 'desc';
    this.queryParams.update((params) => ({
      ...params,
      orderDirection,
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
