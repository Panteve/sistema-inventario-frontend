export interface OpenCashRegisterRequest {
  initialAmount: number;
  officeId: number;
}

export interface CashRegisterResponse {
  id: number;
  officedId: number;
  openedById: number;
  openedAt: string;
  closedAt?: string;
  closedById?: number;
  initialAmount: number;
  finalAmount?: number;
}

export interface Payment {
  id: number;
  amount: number;
  paymentMethod: {
    affectsCash: boolean;
  };
}
export interface Expense {
  id: number;
  amount: number;
}

export interface CloseCashRegisterRequest {
  amountRecived: number;
  difference: number;
}

export interface CashRegisterSummaryResponse extends CashRegisterSummary {
  office: {
    id: number;
    name: string;
  };
}

export interface CashRegisterSummary {
  openedAt: string;
  closedAt: string | null;
  initialAmount: number;
  finalAmount: number;
  payments: Payment[];
  expenses: Expense[];
}
