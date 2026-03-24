interface Product {
  productId: number;
  name?: string;
  quantity: number;
}

export interface CreateInventoryMovementRequest {
  type: 'IN' | 'OUT' | 'TRANSFER';
  toOfficeId: number; // Solo para TRANSFER
  fromOfficeId: number; // Solo para TRANSFER
  products: Product[];
}
