import { Injectable, signal } from '@angular/core';
import { Expense } from '../../../shared/interfaces/expense.interface';

@Injectable({ providedIn: 'root' })
export class ExpenseNotificationService {
  #expenseCreated = signal<Expense | null>(null);

  expenseCreated = this.#expenseCreated.asReadonly();

  notifyExpenseCreated(expense: Expense) {
    this.#expenseCreated.set(expense);
  }

  clearNotification() {
    this.#expenseCreated.set(null);
  }
}
