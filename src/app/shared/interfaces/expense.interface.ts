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
  createdAt: string;
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

export interface ParamsGetExpenses {
  startDate: string;
  endDate: string;
  officeId?: number;
  employeeId?: number;
  amountMin?: number;
  amountMax?: number;
  reasonKeyword?: string;
  orderBy: 'createdAt' | 'amount';
  orderDirection: 'asc' | 'desc';
  page: number;
  limit: number;
}