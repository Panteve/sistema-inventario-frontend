export interface Employee {
  id: number;
  document: string;
  name: string;
  role: string;
  officeId?: number;
  officeName?: string;
  cashRegister: boolean;
}

export interface LoginResponse {
    access_token: string;
    user: Employee
}

export interface LoginData {
  document: string;
  password: string;
}
