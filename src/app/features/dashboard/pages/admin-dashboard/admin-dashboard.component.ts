import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  DashboardCharts,
  DashboardProduct,
  DashboardSummary,
  ParamsGetDashboard,
} from '../../../../shared/interfaces/dashboard.interfacce';
import { ToastService } from '../../../../shared/services/toast.service';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { DashboardService } from '../../services/dashboard.service';
import { AdminDashboardFiltersComponent } from '../../components/admin-dashboard-filters/admin-dashboard-filters.component';
import {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexTooltip,
  ApexMarkers,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexAnnotations,
  ApexStates,
  ApexTheme,
  NgApexchartsModule,
} from 'ng-apexcharts';
export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  annotations?: ApexAnnotations;
  states?: ApexStates;
  theme?: ApexTheme;
  colors?: string[];
  labels?: any;
};
@Component({
  selector: 'app-admin-dashboard.component',
  imports: [AdminDashboardFiltersComponent, DatePipe, CopPipe, NgApexchartsModule],
  providers: [CopPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnDestroy {
  #toastService = inject(ToastService);
  #dashboardService = inject(DashboardService);
  #router = inject(Router);
  #progressAnimationTimeout?: ReturnType<typeof setTimeout>;
  #copPipe = inject(CopPipe);

  topProductsByRevenue = signal<boolean>(true);
  progressBarsReady = signal<boolean>(false);

  loadingSummary = signal<boolean>(false);
  loadingProducts = signal<boolean>(false);
  loadingCharts = signal<boolean>(false);
  dashboardSummary = signal<DashboardSummary>({
    totalSales: { current: 0, previous: 0, diff: 0, diffPercentage: 0 },
    totalBills: { current: 0, previous: 0, diff: 0, diffPercentage: 0 },
    averageBill: { current: 0, previous: 0, diff: 0, diffPercentage: 0 },
    activeOffices: 0,
    activeCashRegisters: [],
  });
  dashboardProducts = signal<DashboardProduct>({
    topSellingProductsByQuantity: [],
    topSellingProductsByRevenue: [],
    lowStockProducts: [],
    outOfStockProducts: [],
  });
  dashboardCharts = signal<DashboardCharts>({
    currentOfficeSales: [],
    previousOfficeSales: [],
    paymentMethodDistribution: [],
    salesByHour: [],
  });

  onFiltersChange(filters: ParamsGetDashboard) {
    this.applyFilters(filters);
  }

  public chartOptions: Partial<ChartOptions> = this.#buildOfficeSalesChartOptions(
    this.dashboardCharts(),
  );

  applyFilters(filters: ParamsGetDashboard) {
    this.loadingSummary.set(true);
    this.loadingProducts.set(true);
    this.loadingCharts.set(true);
    this.#dashboardService
      .getDashboardSummary(filters)
      .pipe(finalize(() => this.loadingSummary.set(false)))
      .subscribe({
        next: (response) => {
          this.dashboardSummary.set(response);
          this.#dashboardService
            .getDashboardProducts(filters)
            .pipe(finalize(() => this.loadingProducts.set(false)))
            .subscribe({
              next: (products) => {
                this.dashboardProducts.set(products);
                this.#animateProgressBars();
                this.#dashboardService
                  .getDashboardCharts(filters)
                  .pipe(
                    finalize(() => {
                      this.loadingCharts.set(false);
                    }),
                  )
                  .subscribe({
                    next: (charts) => {
                      this.dashboardCharts.set(charts);
                      this.chartOptions = this.#buildOfficeSalesChartOptions(charts);
                    },
                  });
              },
            });
        },
        error: () => {
          this.loadingProducts.set(false);
          this.loadingSummary.set(false);
          this.loadingCharts.set(false);
          this.#toastService.show({
            title: 'Error',
            content: 'Error al obtener el resumen del dashboard. Por favor, inténtalo de nuevo.',
            type: 'error',
          });
        },
      });
  }

  ngOnDestroy(): void {
    clearTimeout(this.#progressAnimationTimeout);
  }

  changeTopProducts(event: Event) {
    const input = event.target as HTMLInputElement;
    this.topProductsByRevenue.set(input.checked);
    this.#animateProgressBars();
  }

  safeProgressValue(value: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  progressPercent(value: number, max: number): number {
    const parsedValue = this.safeProgressValue(value);
    const parsedMax = this.safeProgressValue(max);

    if (parsedValue <= 0 || parsedMax <= 0) return 0;

    return Math.min((parsedValue / parsedMax) * 100, 100);
  }

  animatedProgressPercent(value: number, max: number): number {
    if (!this.progressBarsReady()) return 0;

    return this.progressPercent(value, max);
  }

  topRevenueMax(): number {
    return this.#maxOrDefault(
      this.dashboardProducts().topSellingProductsByRevenue.map((item) =>
        this.safeProgressValue(item.quantity),
      ),
    );
  }

  topQuantityMax(): number {
    return this.#maxOrDefault(
      this.dashboardProducts().topSellingProductsByQuantity.map((item) =>
        this.safeProgressValue(item.quantity),
      ),
    );
  }

  navigateToCashRegister(registerId: number) {
    this.#router.navigate(['view-cash-registers/cash-register', registerId]);
  }

  #maxOrDefault(values: number[]): number {
    const max = values.reduce((acc, value) => (value > acc ? value : acc), 0);
    return max > 0 ? max : 1;
  }

  #buildOfficeSalesChartOptions(charts: DashboardCharts): Partial<ChartOptions> {
    const { categories, currentSeries, previousSeries } = this.#buildOfficeSalesComparison(charts);

    return {
      series: [
        {
          name: 'Periodo actual',
          data: currentSeries,
        },
        {
          name: 'Periodo anterior',
          data: previousSeries,
        },
      ],
      chart: {
        type: 'bar',
        height: 320,
        background: 'transparent',
        foreColor: 'var(--color-base-content)',
        toolbar: {
          show: true,
          offsetY: -6,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
          export: {
            csv: {
              filename: 'ventas-por-sucursal',
              columnDelimiter: ',',
              headerCategory: 'Sucursal',
              headerValue: 'Ventas',
            },
            png: {
              filename: 'ventas-por-sucursal',
            },
            svg: {
              filename: 'ventas-por-sucursal',
            },
          },
        },
      },
      colors: ['var(--color-primary)', 'var(--color-secondary)'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['var(--color-base-100)'],
      },
      xaxis: {
        categories,
        axisBorder: {
          color: 'var(--color-base-300)',
        },
        axisTicks: {
          color: 'var(--color-base-300)',
        },
        labels: {
          style: {
            colors: 'var(--color-base-content)',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: 'var(--color-base-content)',
          },
          formatter: (value) => this.#copPipe.transform(value),
        },
      },
      grid: {
        borderColor: 'var(--color-base-300)',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value) => this.#copPipe.transform(value),
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        offsetY: 6,
        itemMargin: {
          horizontal: 12,
          vertical: 6,
        },
        labels: {
          colors: 'var(--color-base-content)',
        },
      },
    };
  }

  #buildOfficeSalesComparison(charts: DashboardCharts): {
    categories: string[];
    currentSeries: number[];
    previousSeries: number[];
  } {
    const officeIds: number[] = [];
    const categories: string[] = [];
    const seen = new Set<number>();

    const addOffice = (officeId: number, officeName: string) => {
      if (seen.has(officeId)) return;
      seen.add(officeId);
      officeIds.push(officeId);
      categories.push(officeName);
    };

    charts.currentOfficeSales.forEach((item) => addOffice(item.officeId, item.officeName));
    charts.previousOfficeSales.forEach((item) => addOffice(item.officeId, item.officeName));

    const currentByOffice = new Map(
      charts.currentOfficeSales.map((item) => [item.officeId, item.total]),
    );
    const previousByOffice = new Map(
      charts.previousOfficeSales.map((item) => [item.officeId, item.total]),
    );

    const currentSeries = officeIds.map((officeId) => currentByOffice.get(officeId) ?? 0);
    const previousSeries = officeIds.map((officeId) => previousByOffice.get(officeId) ?? 0);

    return { categories, currentSeries, previousSeries };
  }

  #animateProgressBars() {
    this.progressBarsReady.set(false);
    clearTimeout(this.#progressAnimationTimeout);
    this.#progressAnimationTimeout = setTimeout(() => {
      this.progressBarsReady.set(true);
    }, 80);
  }
}
