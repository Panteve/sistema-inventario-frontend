import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Expense } from '../../../../shared/interfaces/expense.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';

@Component({
  selector: 'app-view-expense',
  imports: [DatePipe, CopPipe],
  templateUrl: './view-expense.component.html',
})
export class ViewExpenseComponent {
  expenseSelected = input<Expense | null>(null);
}
