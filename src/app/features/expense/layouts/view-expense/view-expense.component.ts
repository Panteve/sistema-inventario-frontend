import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Expense } from '../../../../shared/interfaces/expense.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-view-expense',
  imports: [DatePipe, CopPipe],
  templateUrl: './view-expense.component.html',
})
export class ViewExpenseComponent {
  expenseSelected = input<Expense | null>(null);
  navigateToCashRegister = output<void>();

  emitNavigateToCashRegister() {
    this.navigateToCashRegister.emit();
  }
  
}
