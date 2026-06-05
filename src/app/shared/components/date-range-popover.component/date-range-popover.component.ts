import { DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, model, output } from '@angular/core';
import 'cally';

@Component({
  selector: 'app-date-range-popover',
  imports: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './date-range-popover.component.html',
})
export class DateRangePopoverComponent {
  startDate = input<string>();
  endDate = input<string>();
  todayIso = input<string>();
  inLine = input<boolean>(false);

  get rangeValue(): string {
    return `${this.startDate()}/${this.endDate()}`;
  }

  months = input<number>(2);
  size = input<'sm' | 'md' | 'lg'>('sm');
  idsuffix = input<string>('1');

  rangeStart = output<Event>();
  rangeEnd = output<Event>();

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
    console.log('Range start changed:', event);
    this.rangeStart.emit(event);
  }

  onRangeEnd(event: Event) {
    this.rangeEnd.emit(event);
  }

  isTodayRange(): boolean {
    // return this.filters().startDate === this.todayIso && this.filters().endDate === this.todayIso;
    return true;
  }

  isCurrentWeekRange(): boolean {
    //const weekStart = this.#toIsoDate(this.#startOfWeek(this.#today));
    //return this.filters().startDate === weekStart && this.filters().endDate === this.todayIso;
    return false;
  }

  isCurrentMonthRange(): boolean {
    //  const monthStart = this.#toIsoDate(this.#startOfMonth(this.#today));
    //return this.filters().startDate === monthStart && this.filters().endDate === this.todayIso;
    return false;
  }

  setTodayRange() {
    const today = this.todayIso;
    //this.filters.update((filters) =>
    //  this.#normalizeDateRange({
    //    ...filters,
    //    startDate: today,
    //    endDate: today,
    //  }),
    //);
    //this.#emitFilters();
  }

  setCurrentWeekRange() {
    //const startDate = this.#toIsoDate(this.#startOfWeek(this.#today));
    //this.filters.update((filters) =>
    //  this.#normalizeDateRange({
    //    ...filters,
    //    startDate,
    //    endDate: this.todayIso,
    //  }),
    //);
    //this.#emitFilters();
  }

  setCurrentMonthRange() {
    //const startDate = this.#toIsoDate(this.#startOfMonth(this.#today));
    //this.filters.update((filters) =>
    //  this.#normalizeDateRange({
    //    ...filters,
    //    startDate,
    //    endDate: this.todayIso,
    //  }),
    //);
    //this.#emitFilters();
  }
}
