export interface OpenCashRegisterRequest {
  initialAmount: number;
  officeId: number;
}

export interface PostCashRegisterResponse {
  //CAMBIAR AL NUEVO RETORNO PORQUE ES CON OPERATE BY NO CLOSEDBYID
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

export interface CashRegisterPagination {
  totalItems: number;
  totalPages: number;
}

export interface CashRegisterResponse {
  data: CashRegister[];
  pagination: CashRegisterPagination;
}

export interface CashRegister {
  id: number;
  openedAt: string;
  closedAt?: string;
  initialAmount: number;
  finalAmount: number;
  amountReceived: number;
  difference: number;
  status: boolean;
  office: {
    name: string;
  };
  operateBy: {
    name: string;
  };
}

export interface CashRegisterHistory {
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
