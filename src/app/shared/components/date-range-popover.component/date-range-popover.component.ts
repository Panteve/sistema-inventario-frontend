import { DatePipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, output } from '@angular/core';
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
    this.rangeStart.emit(event);
  }

  onRangeEnd(event: Event) {
    this.rangeEnd.emit(event);
  }
}
