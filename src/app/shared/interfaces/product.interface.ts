export interface ProductOnInventoryResponse {
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

export interface ProductCatalogResponse {
  id: number;
  name: string;
  description?: string;
  unitPrice: number;
  wholesalePrice: number;
}