export interface ProductOnInventoryResponse {
  quantity: number;
  product: {
    id: number;
    name: string;
    description?: string;
    unitPrice: number;
    wholesalePrice: number;
    taxPercentage: number;
  };
  status:boolean
}

export interface changeStatusProductOnInventoryRequest {
  productId: number;
  officeId: number;
  status: boolean;
}

export interface ProductCatalogResponse extends CreateProductRequest {
  id: number;
  status: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  unitPrice: number;
  wholesalePrice: number;
  taxPercentage: number;
}
