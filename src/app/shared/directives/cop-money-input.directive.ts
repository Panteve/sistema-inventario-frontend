import { Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CopPipe } from '../pipes/cop.pipes';

@Directive({
  selector: 'input[copMoneyInput]',
  standalone: true,
  providers: [
    CopPipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CopMoneyInputDirective),
      multi: true,
    },
  ],
  host: {
    '(input)': 'onInput()',
    '(blur)': 'onBlur()',
  },
})
export class CopMoneyInputDirective implements ControlValueAccessor {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private copPipe = inject(CopPipe);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    const n = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
    this.el.nativeElement.value = this.copPipe.transform(n);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  private parseToNumber(raw: string): number {
    const digits = raw.replace(/\D/g, '');
    const n = digits === '' ? 0 : Number.parseInt(digits, 10);
    return Number.isNaN(n) ? 0 : n;
  }

  onInput(): void {
    const raw = this.el.nativeElement.value;
    const value = this.parseToNumber(raw);
    this.onChange(value);
    this.el.nativeElement.value = this.copPipe.transform(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}

