export interface Employee {
  id: number;
  document: string;
  role: string;
  officeId?: number;
  officeName?: string;
}

export interface LoginResponse {
    access_token: string;
    user: Employee
}

export interface LoginData {
  document: string;
  password: string;
}
