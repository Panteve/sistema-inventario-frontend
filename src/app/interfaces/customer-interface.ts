export type Role = 'CLIENT' | 'BUSINESS';

export interface CreateCustomerRequest { 
    document: string;
    email: string;
    name: string;
    phone: string;
    role: Role;
}
export interface CustomerResponse {
    id: number;
    document: string;
    email: string;
    name: string;
    phone: string;
    status: string;
    createdAt: string;
    role: Role;
}