import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, output, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'cally';
import { PaymentMethodStore } from '../../../../shared/store/payment-method-store';
import { ParamsGetDashboard } from '../../../../shared/interfaces/dashboard.interfacce';
import { OfficeSelectComponent } from '../../../../shared/components/office-select.component/office-select.component';
import { EmployeeSelectComponent } from '../../../../shared/components/employee-select.component/employee-select.component';
import { DateRangePopoverComponent } from '../../../../shared/components/date-range-popover.component/date-range-popover.component';
import { AuthStore } from '../../../../core/store/auth-store';

@Component({
  selector: 'app-admin-dashboard-filters',
  imports: [OfficeSelectComponent, EmployeeSelectComponent, DateRangePopoverComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-dashboard-filters.component.html',
})
export class AdminDashboardFiltersComponent implements OnInit {
  readonly maxRangeMonths = 3;
  readonly #filtersStorageKey = 'adminDashboardFilters';

  paymentMethodStore = inject(PaymentMethodStore);
  authStore = inject(AuthStore);
  #route = inject(ActivatedRoute);

  readonly #today = new Date();
  readonly todayIso = this.#toIsoDate(this.#today);

  filters = signal<ParamsGetDashboard>(this.#buildDefaultParams());
  filtersChange = output<{
    filters: ParamsGetDashboard;
    changeJustPaymentMethod: boolean;
  }>();

  get rangeValue(): string {
    return `${this.filters().startDate}/${this.filters().endDate}`;
  }

  ngOnInit(): void {
    const defaults = this.#buildDefaultParams();
    const params = this.#route.snapshot.queryParamMap;
    const hasNonDateParams = ['officeId', 'employeeId', 'paymentMethodId'].some((key) =>
      params.has(key),
    );
    const savedFilters = hasNonDateParams ? null : this.#loadSavedFilters();
    const sourceParams = savedFilters ?? defaults;

    const startDate = this.#isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : sourceParams.startDate;
    const endDate = this.#isIsoDate(params.get('endDate'))
      ? params.get('endDate')!
      : sourceParams.endDate;
    const officeId = this.#parseNumber(params.get('officeId')) ?? sourceParams.officeId;
    const employeeId = this.#parseNumber(params.get('employeeId')) ?? sourceParams.employeeId;
    const paymentMethodId =
      this.#parseNumber(params.get('paymentMethodId')) ?? sourceParams.paymentMethodId;

    this.filters.set(
      this.#normalizeDateRange({
        ...defaults,
        startDate,
        endDate,
        officeId,
        employeeId,
        paymentMethodId,
      }),
    );
    this.#emitFilters();
  }

  changeStartDate(startDate: string) {
    if (!startDate) return;
    this.filters.update((filters) => ({
      ...filters,
      startDate,
    }));
  }

  changeEndDate(endDate: string) {
    if (!endDate) return;
    this.filters.update((filters) => ({
      ...filters,
      endDate,
    }));
    this.#emitFilters();
  }

  changeOffice(value: number) {
    const officeId = value || undefined;
    this.filters.update((filters) => ({
      ...filters,
      officeId,
      employeeId: undefined,
    }));
    this.#emitFilters();
  }

  changeEmployee(id: number) {
    this.filters.update((filters) => ({
      ...filters,
      employeeId: id || undefined,
    }));
    this.#emitFilters();
  }

  changePaymentMethod(event: Event) {
    const paymentMethodId = Number((event.target as HTMLSelectElement).value);
    this.filters.update((filters) => ({
      ...filters,
      paymentMethodId: paymentMethodId || undefined,
    }));
    this.#emitFilters(true);
  }

  setTodayRange() {
    const today = this.todayIso;
    this.filters.update((filters) =>
      this.#normalizeDateRange({
        ...filters,
        startDate: today,
        endDate: today,
      }),
    );
    this.#emitFilters();
  }

  setCurrentWeekRange() {
    const startDate = this.#toIsoDate(this.#startOfWeek(this.#today));
    this.filters.update((filters) =>
      this.#normalizeDateRange({
        ...filters,
        startDate,
        endDate: this.todayIso,
      }),
    );
    this.#emitFilters();
  }

  setCurrentMonthRange() {
    const startDate = this.#toIsoDate(this.#startOfMonth(this.#today));
    this.filters.update((filters) =>
      this.#normalizeDateRange({
        ...filters,
        startDate,
        endDate: this.todayIso,
      }),
    );
    this.#emitFilters();
  }

  clearFilters() {
    this.filters.set(this.#buildDefaultParams());
    this.#clearSavedFilters();
    this.#emitFilters();
  }

  #emitFilters(changeMethod: boolean = false) {
    this.#saveFilters();
    if (changeMethod) {
      this.filtersChange.emit({ filters: this.filters(), changeJustPaymentMethod: changeMethod });
      return;
    }

    this.filtersChange.emit({ filters: this.filters(), changeJustPaymentMethod: changeMethod });
  }

  #buildDefaultParams(): ParamsGetDashboard {
    const startDate = this.todayIso;
    const endDate = this.todayIso;

    return {
      startDate,
      endDate,
      officeId: undefined,
      employeeId: undefined,
      paymentMethodId: undefined,
    };
  }

  #normalizeDateRange(filters: ParamsGetDashboard): ParamsGetDashboard {
    let { startDate, endDate } = filters;

    if (startDate > this.todayIso) {
      startDate = this.todayIso;
    }

    const maxEndDate = this.#addMonthsIso(startDate, this.maxRangeMonths);
    const cappedMaxEndDate = maxEndDate > this.todayIso ? this.todayIso : maxEndDate;

    if (endDate < startDate) {
      endDate = startDate;
    }
    if (endDate > cappedMaxEndDate) {
      endDate = cappedMaxEndDate;
    }

    return {
      ...filters,
      startDate,
      endDate,
    };
  }

  #coerceIsoDate(value: unknown): string | null {
    if (value instanceof Date) {
      return this.#toIsoDateUtc(value);
    }
    if (typeof value === 'string' && this.#isIsoDate(value)) {
      return value;
    }
    return null;
  }

  #isIsoDate(value: string | null | undefined): value is string {
    return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  #parseNumber(value: string | null | undefined): number | undefined {
    if (value === null || value === undefined || value.trim() === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  #saveFilters(): void {
    try {
      localStorage.setItem(this.#filtersStorageKey, JSON.stringify(this.filters()));
    } catch (error) {
      console.error('Failed to save filters to localStorage:', error);
    }
  }

  #loadSavedFilters(): ParamsGetDashboard | null {
    try {
      const raw = localStorage.getItem(this.#filtersStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<ParamsGetDashboard>;
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
      const paymentMethodId =
        typeof parsed.paymentMethodId === 'string'
          ? this.#parseNumber(parsed.paymentMethodId)
          : (parsed.paymentMethodId ?? undefined);

      return {
        ...parsed,
        startDate,
        endDate,
        officeId,
        employeeId,
        paymentMethodId,
      } as ParamsGetDashboard;
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

  #toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  #toIsoDateUtc(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  #startOfWeek(date: Date): Date {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  #startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  #addMonthsIso(isoDate: string, months: number): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setMonth(date.getMonth() + months);
    return this.#toIsoDate(date);
  }
}
