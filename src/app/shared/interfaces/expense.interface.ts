export interface CreateExpenseRequest {
  amount: number;
  reason: string;
}

export interface ExpensePagination {
  totalItems: number;
  totalPages: number;
}

export interface ExpenseResponse {
  data: Expense[];
  pagination: ExpensePagination;
}

export interface Expense {
  id: number;
  amount: number;
  reason: string;
  office: {
    id: number;
    name: string;
  };
  employee: {
    id: number;
    name: string;
    document: string;
  };
  cashRegister: {
    id: number;
    openedAt: string;
  };
}

export interface ParamsGetBills {
  startDate: string;
  endDate: string;
  officeId?: number;
  employeeId?: number;
  amountMin?: number;
  amountMax?: number;
  page: number;
  limit: number;
}