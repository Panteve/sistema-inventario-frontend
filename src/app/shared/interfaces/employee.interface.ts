export interface EmployeesByOfficeResponse {
  id: number;
  office: {
    id: number;
  };
  name: string;
}

export enum EmployeeAction {
  CREATE = 'create',
  EDIT_INFO = 'edit-info',
  CHANGE_PASSWORD = 'change-password',
  STATUS_TOGGLE = 'status-toggle',
}

export interface EmployeeResponse {
  id: number;
  document: string;
  email: string;
  name: string;
  phone: string;
  password: string;
  status: boolean;
  createdAt: string;
  office?: {
    id: number;
    name: string;
  }
  role: 'ADMIN' | 'CASHIER';
}

export interface CreateEmployeeRequest {
  document: string;
  email: string;
  name: string;
  phone: string;
  password: string;
  officeId: number;
  role: 'CASHIER' | 'ADMIN';
}

export interface UpdateEmployeeRequest {
  email?: string;
  name?: string;
  phone?: string;
  officeId?: number;
  role?: 'CASHIER' | 'ADMIN';
}
