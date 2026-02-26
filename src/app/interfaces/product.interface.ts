export interface Product {
  quantity: number;
  priceSelected?: number;
  product: {
    id: number;
    name: string;
    description?: string;
    unitPrice: number;
    wholesalePrice: number;
    status: boolean;
  };
}
