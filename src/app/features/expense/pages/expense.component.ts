import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateExpenseRequest } from '../../../shared/interfaces/expense.interface';
import { ExpenseStore } from '../store/expense-store';
import { AuthStore } from '../../../core/store/auth-store';

@Component({
  selector: 'app-expense',
  imports: [ReactiveFormsModule],
  providers: [ExpenseStore, CurrencyPipe],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #currencyPipe = inject(CurrencyPipe);

  expenseStore = inject(ExpenseStore);
  authStore = inject(AuthStore);

  expenseForm = new FormGroup({
    amount: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
      Validators.pattern('^[0-9]+$'),
    ]),
    reason: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(250),
    ]),
  });

  displayAmount() {
    const amount = this.expenseForm.get('amount')?.value ?? 0;
    return this.#currencyPipe.transform(amount, 'COP', '', '1.0-0') ?? '0';
  }

  onAmountInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.expenseForm.get('amount')?.setValue(value);
  }

  onAmountClick(event: Event) {
    (event.target as HTMLInputElement).select();
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const payload: CreateExpenseRequest = {
      amount: Number(this.expenseForm.value.amount),
      reason: this.expenseForm.value.reason?.trim() ?? '',
    };

    this.expenseStore.createExpense(payload);
  }

  closeExpenseModal() {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { expenseModal: null },
      queryParamsHandling: 'merge',
    });
  }
}
