import { ProductOnBillInterface } from "./product-on-bill.interface";

export interface BillInterface {
    userId?: number;
    paymentMethodId: number;
    employeeId: number;
    products: ProductOnBillInterface[];
}


