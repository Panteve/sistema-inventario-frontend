import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CreateExpenseRequest } from '../../../shared/interfaces/expense.interface';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  #http = inject(HttpClient);

  createExpense(expense: CreateExpenseRequest) {
    return this.#http.post(`${environment.apiUrl}/expenses`, expense);
  }
}
