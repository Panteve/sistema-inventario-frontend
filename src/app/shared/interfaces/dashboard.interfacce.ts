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

export interface DashboardProduct {
  topSellingProductsByQuantity: {
    productId: number;
    name: string;
    quantity: number;
  }[];
  topSellingProductsByRevenue: {
    productId: number;
    name: string;
    quantity: number;
  }[];

  lowStockProducts: {
    name: string;
    officeName: string;
    quantity: number;
  }[];

  outOfStockProducts: {
    name: string;
    officeName: string;
    quantity: number;
  }[];
}

export interface DashboardCharts {
  currentOfficeSales: {
    id: number;
    name: string;
    total: number;
  }[];
  previousOfficeSales: {
    id: number;
    name: string;
    total: number;
  }[];
  paymentMethodDistribution: {
    paymentMethodId: number;
    paymentMethodName: string;
    paymentMethodCode: string;
    count: number;
  }[];
  salesByHour: {
    hour: number;
    total: number;
    count: number;
  }[];
}

export interface BarChartData {
  currentData: {
    id: number;
    name: string;
    total: number;
  }[];
  previousData: {
    id: number;
    name: string;
    total: number;
  }[];
}
