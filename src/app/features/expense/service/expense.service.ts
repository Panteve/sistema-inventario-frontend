import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  CreateExpenseRequest,
  Expense,
  ExpenseResponse,
  ParamsGetExpenses,
} from '../../../shared/interfaces/expense.interface';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  #http = inject(HttpClient);

  createExpense(expense: CreateExpenseRequest) {
    return this.#http.post<Expense>(`${environment.apiUrl}/expenses`, expense);
  }

  getExpenses(params: ParamsGetExpenses) {
    const queryParams: any = {
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      limit: params.limit,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };

    if (params.officeId) {
      queryParams.officeId = params.officeId;
    }
    if (params.employeeId) {
      queryParams.employeeId = params.employeeId;
    }
    if (params.amountMin) {
      queryParams.amountMin = params.amountMin;
    }
    if (params.amountMax) {
      queryParams.amountMax = params.amountMax;
    }
    if (params.reasonKeyword) {
      queryParams.reasonKeyWord = params.reasonKeyword;
    }
    return this.#http.get<ExpenseResponse>(`${environment.apiUrl}/expenses`, {
      params: queryParams,
    });
  }
}
