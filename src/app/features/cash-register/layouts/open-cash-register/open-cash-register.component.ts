import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Employee } from '../../../../shared/interfaces/Auth.interface';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { OfficeSelectComponent } from '../../../../shared/components/office-select.component/office-select.component';
import { ModalComponent } from '../../../../shared/components/modal.component/modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-open-cash-register',
  imports: [DatePipe, CopMoneyInputDirective, CopPipe, OfficeSelectComponent, ModalComponent],
  templateUrl: './open-cash-register.component.html',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class OpenCashRegisterComponent {
  employee = input.required<Employee | null>();
  loading = input.required<boolean>();
  closeModal = output<void>();
  openCashRegister = output<{ officeId: number; initialAmount: number }>();

  openConfirmationOpen = signal<boolean>(false);
  amountReceived = signal<number>(0);
  currentDate = Date.now();
  officeId = signal<number>(0);
  selectedOffice = signal<string | null>(null);

  amountInputRef = viewChild<ElementRef<HTMLInputElement>>('amountInputRef');
  openCancelBtnRef = viewChild<ElementRef<HTMLButtonElement>>('openCancelBtnRef');
  openConfirmBtnRef = viewChild<ElementRef<HTMLButtonElement>>('openConfirmBtnRef');
  cancelBtnRef = viewChild<ElementRef<HTMLButtonElement>>('cancelBtnRef');
  confirmBtnRef = viewChild<ElementRef<HTMLButtonElement>>('confirmBtnRef');
  officeSelectCmp = viewChild<OfficeSelectComponent>('officeSelectCmp');

  validateAmount = computed(() => {
    return this.amountReceived() > 0 && this.officeId() !== 0;
  });
  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);

    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  onAmountClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  changeOffice(value: number) {
    this.officeId.set(value);
  }
  setSelectedOffice(name: string | null) {
    this.selectedOffice.set(name);
  }

  closeCashModal() {
    this.closeModal.emit();
  }

  confirmOpenCashRegister() {
    this.openCashRegister.emit({
      officeId: this.officeId(),
      initialAmount: this.amountReceived(),
    });
  }

  cancelOpenCashRegister() {
    this.openConfirmationOpen.set(false);
  }

  requestOpenCashRegister() {
    this.openConfirmationOpen.set(true);
  }

  onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    if (this.openConfirmationOpen()) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (target === this.cancelBtnRef()?.nativeElement) {
          this.confirmBtnRef()?.nativeElement.focus();
        } else {
          this.cancelBtnRef()?.nativeElement.focus();
        }
        return;
      }
      return;
    }

    const selectEl = this.officeSelectCmp()?.selectRef()?.nativeElement;

    if (
      event.key === 'Enter' &&
      target === this.amountInputRef()?.nativeElement &&
      this.validateAmount()
    ) {
      event.preventDefault();
      this.requestOpenCashRegister();
      return;
    }

    // Enter sobre el select nativo -> abrirlo
    if (event.key === 'Enter' && target === selectEl) {
      event.preventDefault();
      if (typeof (target as HTMLSelectElement).showPicker === 'function') {
        try {
          (target as HTMLSelectElement).showPicker();
        } catch {
          // requiere gesto de usuario reciente; si falla, no rompemos nada
        }
      }
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const elements = [
        selectEl,
        this.amountInputRef()?.nativeElement,
        this.openCancelBtnRef()?.nativeElement,
        this.openConfirmBtnRef()?.nativeElement,
      ].filter(Boolean) as HTMLElement[];

      const currentIdx = elements.indexOf(target);
      if (currentIdx === -1) return;

      event.preventDefault(); // esto también bloquea el ciclado nativo cuando target es el select cerrado
      const nextIdx =
        event.key === 'ArrowDown'
          ? (currentIdx + 1) % elements.length
          : (currentIdx - 1 + elements.length) % elements.length;
      elements[nextIdx].focus();
    }
  }
}
