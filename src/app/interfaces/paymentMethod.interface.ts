export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  affectsCash: boolean
  status: boolean;
}