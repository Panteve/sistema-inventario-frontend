import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateExpenseRequest } from '../../../../shared/interfaces/expense.interface';
import { AuthStore } from '../../../../core/store/auth-store';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';
import { ExpenseService } from '../../service/expense.service';
import { ExpenseNotificationService } from '../../service/expense-notification.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-expense',
  imports: [ReactiveFormsModule, CopMoneyInputDirective],
  providers: [],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {
  expenseService = inject(ExpenseService);
  authStore = inject(AuthStore);
  #router = inject(Router);
  #expenseNotification = inject(ExpenseNotificationService);

  closeModal = output<void>();
  loading = signal<boolean>(false);

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
    this.loading.set(true);
    const payload: CreateExpenseRequest = {
      amount: Number(this.expenseForm.value.amount),
      reason: this.expenseForm.value.reason?.trim() ?? '',
    };
    this.expenseService.createExpense(payload).subscribe({
      next: (expenseResponse) => {
        this.loading.set(false);
        this.closeExpenseModal();
        if (this.#router.url.startsWith('/expense-list')) {
          this.#expenseNotification.notifyExpenseCreated(expenseResponse);
        } else {
          this.#router.navigate(['/expense-list'], {
            state: { expense: expenseResponse },
          });
        }
      },
    });
  }

  closeExpenseModal() {
    this.closeModal.emit();
  }
}
