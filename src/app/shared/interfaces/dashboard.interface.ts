export interface ParamsGetDashboard {
  startDate: string;
  endDate: string;
  officeId?: number;
  employeeId?: number;
  paymentMethodId?: number;
}

interface DashboardSummaryItem {
  current: number;
  previous: number;
  diff: number;
  diffPercentage?: number;
}

export interface DashboardSummary {
  totalSales: DashboardSummaryItem;
  totalBills: DashboardSummaryItem;
  averageBill: DashboardSummaryItem;
  totalExpenses: DashboardSummaryItem;
  activeOffices: number;
  activeCashRegisters: {
    id: number;
    officeName: string;
    operateByName: string;
    openedAt: string;
  }[];
}

export interface DashboardTables {
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
  lastExpenses: {
    id: number;
    reason: string;
    amount: number;
    employeeName: string;
    createdAt: string;
  }[];
}

export interface DashboardCharts {
  currentOfficeSales: BarChartDataItem[];
  previousOfficeSales: BarChartDataItem[];
  currentPaymentMethodSales: BarChartDataItem[];
  previousPaymentMethodSales: BarChartDataItem[];
  paymentMethodDistribution: PieChartData[];
  salesByHour: AreaChartData[];
}

export interface PieChartData {
  id: number;
  name: string;
  count: number;
}

export interface AreaChartData {
  hour: number;
  total: number;
  count: number;
}
interface BarChartDataItem {
  id: number;
  name: string;
  total: number;
}

export interface BarChartData {
  currentData: BarChartDataItem[];
  previousData: BarChartDataItem[];
}
