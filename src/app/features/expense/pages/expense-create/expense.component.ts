import { Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateExpenseRequest } from '../../../../shared/interfaces/expense.interface';
import { ExpenseStore } from '../../store/expense-store';
import { AuthStore } from '../../../../core/store/auth-store';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';


@Component({
  selector: 'app-expense',
  imports: [ReactiveFormsModule, CopMoneyInputDirective],
  providers: [ExpenseStore],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {


  expenseStore = inject(ExpenseStore);
  authStore = inject(AuthStore);

  closeModal = output<void>();

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
    this.closeModal.emit();
  }
}
