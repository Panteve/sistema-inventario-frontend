interface Product {
  productId: number;
  name?: string;
  quantity: number;
}

export interface CreateInventoryMovementRequest {
  type: 'IN' | 'OUT' | 'TRANSFER';
  toOfficeId: number; // Solo para TRANSFER
  fromOfficeId: number; // Solo para TRANSFER
  reason: string;
  products: Product[];
}

export interface InventoryMovement {
  id: number;
  fromOfficeId: number | null;
  toOfficeId: number | null;
  employeeId: number;
  type: 'IN' | 'OUT' | 'TRANSFER';
  createdAt: string;
  reason: string;
  fromOffice: {
    id: number;
    name: string;
  } | null;
  toOffice: {
    id: number;
    name: string;
  } | null;
  employee: {
    id: number;
    name: string;
    document: string;
  };
  productsOnInventoryMovements: {
    quantity: number;
    product: {
      id: number;
      name: string;
    };
  }[];
}

export interface InventoryMovementPagination {
  totalItems: number;
  totalPages: number;
}

export interface InventoryMovementResponse {
  data: InventoryMovement[];
  pagination: InventoryMovementPagination;
}

export interface ParamsGetInventoryMovements {
  startDate: string;
  endDate: string;
  fromOfficeId?: number;
  toOfficeId?: number;
  employeeId?: number;
  type?: 'IN' | 'OUT' | 'TRANSFER';
  page: number;
  limit: number;
}
