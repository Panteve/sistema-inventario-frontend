export interface OfficeNameIdResponse {
    id: number;
    name: string;
}

export interface OfficeResponse {
    id: number;
    name: string;
    address: string;
    phone: string;
    createdAt: string;
    status: boolean;
}
export interface CreateOfficeRequest {
    name: string;
    address: string;
    phone: string;
    companyId?: 1;
}