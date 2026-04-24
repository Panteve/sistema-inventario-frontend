export interface PaymentMethodResponse extends CreatePaymentMethodRequest {
  id: number;
}

export interface CreatePaymentMethodRequest {
  status: boolean;
  name: string;
  code: string;
  affectsCash: boolean;
}