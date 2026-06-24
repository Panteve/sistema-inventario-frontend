import { DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, input, output, signal } from '@angular/core';
import 'cally';
import { coerceIsoDate, normalizeDateRange, toIsoDate } from '../../utils/filter-query.utils';

@Component({
  selector: 'app-date-range-popover',
  imports: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './date-range-popover.component.html',
})
export class DateRangePopoverComponent {
  startDate = input<string>();
  endDate = input<string>();
  todayIso = input<string>(new Date().toISOString().slice(0, 10));
  inLine = input<boolean>(false);
  months = input<number>(3);
  isAdmin = input<boolean>(false);

  #today = new Date();

  get rangeValue(): string {
    return `${this.startDate()}/${this.endDate()}`;
  }

  size = input<'sm' | 'md' | 'lg'>('sm');
  idsuffix = input<string>('1');

  rangeStart = output<string>();
  rangeEnd = output<string>();

  get buttonId(): string {
    return `cally${this.idsuffix()}`;
  }

  get popoverId(): string {
    return `cally-popover${this.idsuffix()}`;
  }

  get anchorName(): string {
    return `--cally${this.idsuffix()}`;
  }

  onRangeStart(event: Event) {
    const startDate = coerceIsoDate((event as CustomEvent).detail);
    if (!startDate) return;

    const normalized = normalizeDateRange(
      {
        startDate,
        endDate: this.endDate() ?? startDate,
      },
      this.todayIso(),
      this.isAdmin(),
    );
    this.rangeStart.emit(normalized.startDate);
  }

  onRangeEnd(event: Event) {
    const endDate = coerceIsoDate((event as CustomEvent).detail);
    if (!endDate) return;

    const normalized = normalizeDateRange(
      {
        startDate: this.startDate() ?? endDate,
        endDate,
      },
      this.todayIso(),
      this.isAdmin(),
    );
    this.rangeEnd.emit(normalized.endDate);
  }

  isTodayRange(): boolean {
    return this.startDate() === this.todayIso() && this.endDate() === this.todayIso();
  }

  isCurrentWeekRange(): boolean {
    const weekStart = toIsoDate(this.#startOfWeek(this.#today));
    return this.startDate() === weekStart && this.endDate() === this.todayIso();
  }

  isCurrentMonthRange(): boolean {
    const monthStart = toIsoDate(this.#startOfMonth(this.#today));
    return this.startDate() === monthStart && this.endDate() === this.todayIso();
  }

  isCurrentYearRange(): boolean {
    const yearStart = toIsoDate(this.#startOfYear(this.#today));
    return this.startDate() === yearStart && this.endDate() === this.todayIso();
  }

  setTodayRange() {
    const today = this.todayIso();

    this.rangeStart.emit(today);
    this.rangeEnd.emit(today);
  }

  setCurrentWeekRange() {
    const startDate = toIsoDate(this.#startOfWeek(this.#today));
    const normalized = normalizeDateRange(
      {
        startDate,
        endDate: this.todayIso(),
      },
      this.todayIso(),
      this.isAdmin(),
    );

    this.rangeStart.emit(normalized.startDate);
    this.rangeEnd.emit(normalized.endDate);
  }

  setCurrentMonthRange() {
    const startDate = toIsoDate(this.#startOfMonth(this.#today));
    const normalized = normalizeDateRange(
      {
        startDate,
        endDate: this.todayIso(),
      },
      this.todayIso(),
      this.isAdmin(),
    );

    this.rangeStart.emit(normalized.startDate);
    this.rangeEnd.emit(normalized.endDate);
  }

  setCurrentYearRange() {
    const startDate = toIsoDate(this.#startOfYear(this.#today));
    const normalized = normalizeDateRange(
      {
        startDate,
        endDate: this.todayIso(),
      },
      this.todayIso(),
      this.isAdmin(),
    );

    this.rangeStart.emit(normalized.startDate);
    this.rangeEnd.emit(normalized.endDate);
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

  #startOfYear(date: Date): Date {
    return new Date(date.getFullYear(), 0, 1);
  }
}
