export interface PaymentMethodResponse extends CreatePaymentMethodRequest {
  id: number;
  status: boolean;
}

export interface CreatePaymentMethodRequest {
  name: string;
  code: string;
  affectsCash: boolean;
}