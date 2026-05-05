export interface ProductOnBill {
  productId: number;
  name?: string;
  priceUnique: number;
  quantity: number;
  taxPercentage: number;
}

export interface CreateBillRequest {
  customerId?: number;
  paymentMethodId: number;
  products: ProductOnBill[];
}

export interface ProductSelected {
  product: {
    name: string;
    id: number;
    unitPrice: number;
    wholesalePrice: number;
  };
  priceSelected: number;
  quantity: number;
}

export interface BillsHistoryResponse {
  id: number;
  status: boolean;
  total: number;
  createdAt: string;
  customer: {
    name: string;
  } | null;
  employee: {
    name: string;
  };
}

export interface BillsHistoryPagination {
  totalItems: number;
  totalPages: number;
}

export interface BillsHistoryListResponse {
  data: BillsHistoryResponse[];
  pagination: BillsHistoryPagination;
}

export interface ParamsGetBills {
  startDate: string;
  endDate: string;
  officeId?: number;
  employeeId?: number;
  customerKeyword?: string;
  page: number;
  limit: number;
}

export interface BillResponse {
  id: number;
  status: boolean;
  total: number;
  products: {
    quantity: number;
    priceUnique: number;
    priceTotal: number;
    taxPercentage: number;
    taxAmount: number;
    id: number;
    name: string;
  }[];
  customer: {
    id: number;
    name: string;
    document: string;
    phone: string;
  } | null;
  cashRegister: {
    id: number;
    officeId: number;
  };
  employee: {
    id: number;
    name: string;
    document: string;
    phone: string;
  };
}
