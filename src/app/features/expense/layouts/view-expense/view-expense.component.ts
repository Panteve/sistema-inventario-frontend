import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Expense } from '../../../../shared/interfaces/expense.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { AuthStore } from '../../../../core/store/auth-store';
import { ExpenseService } from '../../service/expense.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-view-expense',
  imports: [DatePipe, CopPipe],
  templateUrl: './view-expense.component.html',
})
export class ViewExpenseComponent {
  expenseSelected = input<Expense | null>(null);
  navigateToCashRegister = output<void>();
  expenseCancelled = output<number>();

  #authStore = inject(AuthStore);
  #expenseService = inject(ExpenseService);
  #toastService = inject(ToastService);

  canCancel = computed(() => {
    const expense = this.expenseSelected();
    const employee = this.#authStore.employee();
    if (!expense || !employee) return false;
    return expense.cashRegister.id === employee.cashRegister;
  });

  emitNavigateToCashRegister() {
    this.navigateToCashRegister.emit();
  }

  cancelExpense() {
    const expenseId = this.expenseSelected()!.id;
    if (!expenseId) return;

    this.#expenseService.cancelExpense(expenseId).subscribe({
      next: () => {
        this.#toastService.show({
          content: 'Gasto cancelado correctamente.',
          type: 'success',
        });
        this.expenseCancelled.emit(expenseId);
      },
      error: () => {
        this.#toastService.show({
          content: 'Error al cancelar el gasto. Intenta de nuevo.',
          type: 'error',
        });
      },
    });
  }
}
