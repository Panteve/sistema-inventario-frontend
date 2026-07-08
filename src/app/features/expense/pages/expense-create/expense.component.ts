import { ChangeDetectionStrategy, Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
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
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class ExpenseComponent {
  expenseService = inject(ExpenseService);
  authStore = inject(AuthStore);
  #router = inject(Router);
  #expenseNotification = inject(ExpenseNotificationService);

  closeModal = output<void>();
  loading = signal<boolean>(false);

  amountInputRef = viewChild<ElementRef<HTMLInputElement>>('amountInputRef');
  reasonTextareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('reasonTextareaRef');
  submitBtnRef = viewChild<ElementRef<HTMLButtonElement>>('submitBtnRef');

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

  onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;

    const target = event.target as HTMLElement;

    if (target === this.amountInputRef()?.nativeElement) {
      event.preventDefault();
      this.reasonTextareaRef()?.nativeElement.focus();
      return;
    }

    if (target === this.reasonTextareaRef()?.nativeElement) {
      event.preventDefault();
      if (this.expenseForm.invalid) {
        this.expenseForm.markAllAsTouched();
        return;
      }
      console.log('valido')
      this.submitBtnRef()?.nativeElement.focus();
    }
  }
}
