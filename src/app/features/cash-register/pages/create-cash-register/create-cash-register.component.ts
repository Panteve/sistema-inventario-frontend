import { Component, inject, output } from '@angular/core';
import { CashRegisterStore } from '../../store/cash-register-store';
import { InventoryStore } from '../../../../shared/store/inventory-store';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { AuthStore } from '../../../../core/store/auth-store';
import { CloseCashRegisterComponent } from '../../layouts/close-cash-register/close-cash-register.component';
import { OpenCashRegisterComponent } from '../../layouts/open-cash-register/open-cash-register.component';

@Component({
  selector: 'app-cash-register',
  imports: [CloseCashRegisterComponent, OpenCashRegisterComponent],
  providers: [CopPipe, CashRegisterStore],
  templateUrl: './create-cash-register.component.html',
  styleUrl: './create-cash-register.component.css',
})
export class CreateCashRegisterComponent {
  authStore = inject(AuthStore);
  inventoryStore = inject(InventoryStore);
  cashRegisterStore = inject(CashRegisterStore);

  closeModal = output<void>();

  openCashRegister({ officeId, initialAmount }: { officeId: number; initialAmount: number }) {
    this.cashRegisterStore.openCashRegister({
      officeId,
      initialAmount,
    });
  }

  closeCashRegister(amountReceived: number) {
    this.cashRegisterStore.closeCashRegister(amountReceived);
  }

  closeCashModal() {
    this.closeModal.emit();
  }
}
