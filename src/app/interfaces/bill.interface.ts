export interface ProductOnBill {
    name?: string;
    productId: number;
    priceUnique?: number;
    quantity: number;
    taxPercentage?: number;
}
export interface Bill {
    customerId?: number;
    paymentMethodId: number;
    cashRegisterId?: number;
    products: ProductOnBill[];
}


