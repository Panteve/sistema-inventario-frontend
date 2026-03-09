export interface ProductResponse {
  quantity: number;
  product: {
    id: number;
    name: string;
    description?: string;
    unitPrice: number;
    wholesalePrice: number;
    status: boolean;
  };
}
