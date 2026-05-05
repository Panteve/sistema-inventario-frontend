import { Component, computed, inject, signal } from '@angular/core';
import { AuthStore } from '../../../core/store/auth-store';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CashRegisterStore } from '../store/cash-register-store';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryStore } from '../../../shared/store/inventory-store';
import { OfficeStore } from '../../../shared/store/office-store';
import { CopPipe } from '../../../shared/pipes/cop.pipes';

@Component({
  selector: 'app-cash-register',
  imports: [CopPipe, DatePipe, DecimalPipe],
  providers: [CopPipe, CashRegisterStore],
  templateUrl: './cash-register.component.html',
  styleUrl: './cash-register.component.css',
})
export class CashRegisterComponent {
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  officeStore = inject(OfficeStore);
  authStore = inject(AuthStore);
  inventoryStore = inject(InventoryStore);
  cashRegisterStore = inject(CashRegisterStore);
  #copPipe = inject(CopPipe);

  currentDate = Date.now();
  currentHour = new Date().getHours();
  currentMinute = new Date().getMinutes();
  closeConfirmationOpen = signal<boolean>(false);
  officeId = signal<number>(0);
  amountReceived = signal<number>(0);

  expected = computed(() => {
    return (
      this.cashRegisterStore.cashRegisterSummary().initialAmount +
      this.cashRegisterStore.cashRegisterSummary().totalCashSales -
      this.cashRegisterStore.cashRegisterSummary().totalExpenses
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
    if (difference === 0) return 'ok';
    return difference < 0 ? 'short' : 'over';
  });
  differenceFeedback = computed(() => {
    switch (this.differenceStatus()) {
      case 'short':
        return 'Faltante detectado: revisa pagos en efectivo y gastos antes de cerrar.';
      case 'over':
        return 'Sobrante detectado: valida transferencias y registros manuales.';
      default:
        return 'Cuadre correcto: la caja coincide con el total esperado.';
    }
  });

  displayAmount = computed(() => {
    return this.#copPipe.transform(this.amountReceived()) ?? '0';
  });

  displayExpectedCash = computed(() => {
    return this.#copPipe.transform(this.expected()) ?? '0.00';
  });

  displayDifference = computed(() => {
    this.cashDifference();
    return this.#copPipe.transform(this.cashDifference()) ?? '0.00';
  });

  onAmountReceivedChange(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.amountReceived.set(isNaN(value) ? 0 : value);
  }

  onAmountClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  openCashRegister() {
    this.cashRegisterStore.openCashRegister({
      officeId: this.officeId(),
      amountReceived: this.amountReceived(),
    });
  }

  requestCloseCashRegister() {
    if (this.cashRegisterStore.loading()) {
      return;
    }

    this.closeConfirmationOpen.set(true);
  }

  cancelCloseCashRegister() {
    this.closeConfirmationOpen.set(false);
  }

  confirmCloseCashRegister() {
    this.closeConfirmationOpen.set(false);
    this.cashRegisterStore.closeCashRegister(this.amountReceived());
  }

  closeCashModal() {
    this.closeConfirmationOpen.set(false);
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { cashModal: null },
      queryParamsHandling: 'merge',
    });
  }
  changeOffice(event: Event) {
    this.officeId.set(Number((event.target as HTMLSelectElement).value));
  }
}
