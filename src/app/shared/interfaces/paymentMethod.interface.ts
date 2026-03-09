export interface PaymentMethodResponse {
  id: number;
  name: string;
  code: string;
  affectsCash: boolean
  status: boolean;
}