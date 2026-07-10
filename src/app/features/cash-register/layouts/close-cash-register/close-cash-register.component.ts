import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Employee } from '../../../../shared/interfaces/Auth.interface';
import {
  CashRegisterSummaryResponse,
  CloseCashRegisterRequest,
} from '../../../../shared/interfaces/cash-register-interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';
import { ModalComponent } from '../../../../shared/components/modal.component/modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-close-cash-register',
  imports: [DatePipe, CopPipe, CopMoneyInputDirective, ModalComponent],
  templateUrl: './close-cash-register.component.html',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class CloseCashRegisterComponent {
  employee = input.required<Employee | null>();
  cashRegisterSummary = input.required<CashRegisterSummaryResponse>();
  closeModal = output<void>();
  closeCashRegister = output<CloseCashRegisterRequest>();
  loading = input.required<boolean>();
  loadingSummary = input.required<boolean>();

  currentDate = new Date();
  closeConfirmationOpen = signal<boolean>(false);
  amountReceived = signal<number>(0);
  observation = signal<string | undefined>(undefined);

  amountInputRef = viewChild<ElementRef<HTMLInputElement>>('amountInputRef');
  obsTextareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('obsTextareaRef');
  cancelBtnRef = viewChild<ElementRef<HTMLButtonElement>>('cancelBtnRef');
  closeBtnRef = viewChild<ElementRef<HTMLButtonElement>>('closeBtnRef');
  confirmCancelBtnRef = viewChild<ElementRef<HTMLButtonElement>>('confirmCancelBtnRef');
  confirmBtnRef = viewChild<ElementRef<HTMLButtonElement>>('confirmBtnRef');

  constructor() {
    afterRenderEffect(() => {
      if (!this.loadingSummary()) {
        const input = this.amountInputRef()?.nativeElement;
        input?.focus();
        input?.select();
        const container = input?.closest<HTMLElement>('.overflow-y-auto');
        if (container) container.scrollTop = container.scrollHeight;
      }
    })
  }

  expected = computed(() => {
    return (
      this.cashRegisterSummary().initialAmount +
      this.cashRegisterSummary().totalCashSales -
      this.cashRegisterSummary().totalExpenses
    );
  });
  cashDifference = computed(() => {
    if (this.expected() < 0) {
      return this.amountReceived() + this.expected();
    }
    return this.amountReceived() - this.expected();
  });
  differenceStatus = computed<'ok' | 'short' | 'over'>(() => {
    const difference = this.cashDifference();
    if (Math.abs(difference) <= 50) return 'ok';
    return difference < 0 ? 'short' : 'over';
  });

  emitCloseCashModal() {
    this.closeModal.emit();
  }

  requestCloseCashRegister() {
    this.closeConfirmationOpen.set(true);
  }

  cancelCloseCashRegister() {
    this.closeConfirmationOpen.set(false);
    this.amountInputRef()?.nativeElement.focus();
  }

  confirmCloseCashRegister() {
    this.closeCashRegister.emit({
      amountReceived: this.amountReceived(),
      observation: this.observation(),
    });
  }

  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  onObservationChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    if (raw.trim() === '') {
      this.observation.set(undefined);
      return;
    }
    this.observation.set(raw);
  }

  onAmountClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    if (this.closeConfirmationOpen() && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      const btns = [
        this.confirmCancelBtnRef()?.nativeElement,
        this.confirmBtnRef()?.nativeElement,
      ].filter(Boolean) as HTMLElement[];
      const index = btns.indexOf(target);
      if (index === -1) return;
      event.preventDefault();
      const next =
        event.key === 'ArrowRight'
          ? (index + 1) % btns.length
          : (index - 1 + btns.length) % btns.length;
      btns[next].focus();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const elements = [
        this.amountInputRef()?.nativeElement,
        this.obsTextareaRef()?.nativeElement,
        this.cancelBtnRef()?.nativeElement,
        this.closeBtnRef()?.nativeElement,
      ].filter(Boolean) as HTMLElement[];

      const index = elements.indexOf(target);
      if (index === -1) return;
      event.preventDefault();
      const next =
        event.key === 'ArrowDown'
          ? (index + 1) % elements.length
          : (index - 1 + elements.length) % elements.length;
      elements[next].focus();
      return;
    }

    if (event.key !== 'Enter') return;

    if (target === this.amountInputRef()?.nativeElement) {
      event.preventDefault();
      this.obsTextareaRef()?.nativeElement.focus();
      return;
    }

    if (target === this.obsTextareaRef()?.nativeElement) {
      event.preventDefault();
      this.requestCloseCashRegister();
    }
  }
}
