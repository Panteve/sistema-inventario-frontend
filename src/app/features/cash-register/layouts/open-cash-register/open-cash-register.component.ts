import { DatePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { Employee } from '../../../../shared/interfaces/Auth.interface';
import { OfficeNameIdResponse } from '../../../../shared/interfaces/office.interface';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';

@Component({
  selector: 'app-open-cash-register',
  imports: [DatePipe, CopMoneyInputDirective, CopPipe],
  templateUrl: './open-cash-register.component.html',
})
export class OpenCashRegisterComponent {
  employee = input.required<Employee | null>();
  officesList = input.required<OfficeNameIdResponse[]>();
  loading = input.required<boolean>();
  closeModal = output<void>();
  openCashRegister = output<{ officeId: number; initialAmount: number }>();

  openConfirmationOpen = signal<boolean>(false);
  amountReceived = signal<number>(0);
  currentDate = Date.now();
  officeId = 0;
  selectedOffice = signal<string | null>(null);

  validateAmount = computed(() => {
    return this.amountReceived() > 0;
  })
  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);

    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  onAmountClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  changeOffice(event: Event) {
    this.officeId = Number((event.target as HTMLSelectElement).value);
    this.selectedOffice.set(this.officesList().find((o) => o.id === this.officeId)?.name ?? null);
  }

  closeCashModal() {
    this.closeModal.emit();
  }

  confirmOpenCashRegister() {
    this.openCashRegister.emit({
      officeId: this.officeId,
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
