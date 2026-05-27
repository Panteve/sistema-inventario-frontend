export interface ParamsGetDashboard {
  startDate: string;
  endDate: string;
  officeId?: number;
  employeeId?: number;
  paymentMethodId?: number;
}

export interface DashboardSummary {
  totalSales: {
    current: number;
    previous: number;
    diff: number;
    diffPercentage?: number;
  };
  totalBills: {
    current: number;
    previous: number;
    diff: number;
    diffPercentage?: number;
  };
  averageBill: {
    current: number;
    previous: number;
    diff: number;
    diffPercentage?: number;
  };
  activeOffices: number;
  activeCashRegisters: {
    id: number;
    officeName: string;
    operateByName: string;
    openedAt: string;
  }[];
}
