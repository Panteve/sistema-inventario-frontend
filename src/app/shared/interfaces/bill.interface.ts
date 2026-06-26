export interface ProductOnBill {
  productId: number;
  name?: string;
  priceUnique: number;
  quantity: number;
  taxPercentage?: number;
  taxAmount?: number;
}

export interface CreateBillRequest {
  customerId?: number;
  paymentMethodId: number;
  amountReceived: number;
  products: ProductOnBill[];
}

export interface ProductSelected {
  name: string;
  id: number;
  unitPrice: number;
  wholesalePrice: number;
  priceSelected: number;
  quantity: number;
  taxpercentage: number;
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
  subtotal: number;
  taxAmount: number;
  total: number;
  amountReceived: number;
  difference: number;
  createdAt: string;
  products: {
    quantity: number;
    priceUnique: number;
    subtotal: number;
    total: number;
    taxPercentage: number;
    taxAmount: number;
    id: number;
    productName: string;
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
  payments: { paymentMethodName: string }[];
}
