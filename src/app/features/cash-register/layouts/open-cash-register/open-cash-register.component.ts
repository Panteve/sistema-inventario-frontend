import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
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

  validateAmount = computed(() => {
    return this.amountReceived() > 0;
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
}
