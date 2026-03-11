import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorStore } from '../../../core/store/errors-store';
import { CreateExpenseRequest } from '../../../shared/interfaces/expense.interface';
import { ExpenseStore } from '../store/expense-store';
import { CashRegisterStore } from '../../cash-register/store/cash-register-store';

@Component({
  selector: 'app-expense',
  imports: [ReactiveFormsModule],
  providers: [ExpenseStore, CurrencyPipe],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private currencyPipe = inject(CurrencyPipe);

  expenseStore = inject(ExpenseStore);
  errorStore = inject(ErrorStore);
  cashRegisterStore = inject(CashRegisterStore);

  amountFocus = signal<boolean>(false);

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

  displayAmount = computed(() => {
    if (this.amountFocus()) {
      const val = this.expenseForm.value.amount;
      return val === 0 ? '' : String(val);
    }
    return this.currencyPipe.transform(this.expenseForm.value.amount, 'COP', '', '1.2-2') ?? '0.00';
  });

  onAmountInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
    const value = Number(raw);
    this.expenseForm.get('amount')?.setValue(value);
    this.errorStore.clearError();
  }

  onReasonInput() {
    this.errorStore.clearError();
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { expenseModal: null },
      queryParamsHandling: 'merge',
    });
  }
}
