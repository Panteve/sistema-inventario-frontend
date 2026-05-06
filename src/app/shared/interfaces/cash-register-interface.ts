export interface OpenCashRegisterRequest {
  initialAmount: number;
  officeId: number;
}

export interface CashRegisterResponse {
  id: number;
  openedAt: string;
  closedAt?: string;
  closedById?: number;
  initialAmount: number;
  finalAmount: number;
  office: {
    id: number;
    name: string;
  };
}

export interface Payment {
  id: number;
  amount: number;
  paymentMethod: {
    affectsCash: boolean;
  };
}


export interface CashRegisterSummaryResponse extends CashRegisterSummary {
  office: {
    id: number;
    name: string;
  };
}

export interface CashRegisterSummary {
  openedAt: string;
  initialAmount: number;
  totalCashSales: number;
  totalTransferSales: number;
  totalExpenses: number;
}
