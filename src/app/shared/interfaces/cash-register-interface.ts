export interface OpenCashRegisterRequest {
  initialAmount: number;
  officeId: number;
}

export interface PostCashRegisterResponse {
  //CAMBIAR AL NUEVO RETORNO PORQUE ES CON OPERATE BY NO CLOSEDBYID
  id: number;
  openedAt: string;
  closedAt?: string;
  initialAmount: number;
  finalAmount: number;
  difference: number;
  status: boolean;
  office: {
    id: number;
    name: string;
  };
}

export interface CashRegisterFullHistoryResponse {
  id: number;
  openedAt: string;
  closedAt?: string;
  initialAmount: number;
  finalAmount: number;
  amountRecived: number;
  difference: number;
  status: boolean;
  office: {
    name: string;
  };
  operateBy: {
    name: string;
  };
  bills: {
    id: number;
    createdAt: string;
    customer?: {
      name: string;
    };
    total: number;
    payments: {
      paymentMethod: {
        name: string;
      };
    }[];
  }[];
  expenses: {
    id: number;
    createdAt: string;
    amount: number;
    reason: string;
  }[];
  totalCashSales: number;
  totalTransferSales: number;
  totalSales: number;
  totalExpenses: number;
  topProducts: {
    name: string;
    totalQuantity: number;
    totalAmount: number;
  }[];
}

export interface CashRegisterHistory {
  id: number;
  openedAt: string;
  closedAt?: string;
  finalAmount: number;
  totalSales: number;
  difference: number;
  status: boolean;
  office: {
    id: number;
    name: string;
  };
  operateBy: {
    name: string;
  };
}

export interface CashRegisterHistoryPagination {
  totalItems: number;
  totalPages: number;
}

export interface CashRegisterHistoryResponse {
  data: CashRegisterHistory[];
  pagination: CashRegisterHistoryPagination;
}

export interface ParamsGetCashRegisters {
  startDate: string;
  endDate: string;
  officeId?: number;
  employeeId?: number;
  status?: boolean;
  page: number;
  limit: number;
}


export interface CashRegisterSummaryResponse {
  openedAt: string;
  initialAmount: number;
  totalCashSales: number;
  totalTransferSales: number;
  totalExpenses: number;
}
