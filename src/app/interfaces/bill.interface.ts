export interface ProductOnBill{
    productId: number;
    name: string;
    priceUnique: number;
    quantity: number;
    taxPercentage: number;
}

export interface CreateBillRequest {
  customerId?: number;
  paymentMethodId: number;
  cashRegisterId: number;
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