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
