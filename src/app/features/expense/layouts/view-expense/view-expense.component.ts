import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Expense } from '../../../../shared/interfaces/expense.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { ModalComponent } from '../../../../shared/components/modal.component/modal.component';
import { AuthStore } from '../../../../core/store/auth-store';
import { ExpenseService } from '../../service/expense.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-view-expense',
  imports: [DatePipe, CopPipe, ModalComponent],
  templateUrl: './view-expense.component.html',
})
export class ViewExpenseComponent {
  expenseSelected = input<Expense | null>(null);
  navigateToCashRegister = output<void>();
  expenseCancelled = output<number>();

  #authStore = inject(AuthStore);
  #expenseService = inject(ExpenseService);
  #toastService = inject(ToastService);

  showDeleteModal = signal(false);

  canCancel = computed(() => {
    const expense = this.expenseSelected();
    const employee = this.#authStore.employee();
    if (!expense || !employee) return false;
    return expense.cashRegister.id === employee.cashRegister;
  });

  emitNavigateToCashRegister() {
    this.navigateToCashRegister.emit();
  }

  openDeleteModal() {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
  }

  confirmDelete() {
    const expense = this.expenseSelected();
    if (!expense) return;

    this.#expenseService.cancelExpense(expense.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.#toastService.show({
          title: 'Gasto cancelado',
          content: 'Gasto cancelado correctamente.',
          type: 'success',
        });
        this.expenseCancelled.emit(expense.id);
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
