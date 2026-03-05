export interface OpenCashRegisterRequest {
    initialAmount: number;
}

export interface CashRegisterResponse {
    id: number;
    officedId : number;
    openedById: number;
    openedAt: string;
    closedAt?: string;
    closedById?: number;
    initialAmount: number;
    finalAmount?: number;
}