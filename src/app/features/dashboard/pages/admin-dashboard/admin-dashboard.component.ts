import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  BarChartData,
  DashboardCharts,
  DashboardProduct,
  DashboardSummary,
  ParamsGetDashboard,
} from '../../../../shared/interfaces/dashboard.interfacce';
import { ToastService } from '../../../../shared/services/toast.service';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { DashboardService } from '../../services/dashboard.service';
import { AdminDashboardFiltersComponent } from '../../components/admin-dashboard-filters/admin-dashboard-filters.component';
import { AdminDashboardAreaChartComponent } from '../../components/admin-dashboard-area-chart.component/admin-dashboard-area-chart.component';
import { AdminDashboardBarChartComponent } from '../../components/admin-dashboard-bar-chart.component/admin-dashboard-bar-chart.component';
import { AdminDashboardPieChartComponent } from '../../components/admin-dashboard-pie-chart.component/admin-dashboard-pie-chart.component';

@Component({
  selector: 'app-admin-dashboard.component',
  imports: [
    AdminDashboardFiltersComponent,
    DatePipe,
    CopPipe,
    AdminDashboardAreaChartComponent,
    AdminDashboardBarChartComponent,
    AdminDashboardPieChartComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnDestroy {
  #toastService = inject(ToastService);
  #dashboardService = inject(DashboardService);
  #router = inject(Router);
  #progressAnimationTimeout?: ReturnType<typeof setTimeout>;

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

  barChartData = computed<BarChartData>(() => {
    return {
      currentData: this.dashboardCharts().currentOfficeSales,
      previousData: this.dashboardCharts().previousOfficeSales,
    };
  });

  areaChartData = computed(() => {
    return this.dashboardCharts().salesByHour;
  });

  onFiltersChange(data: { filters: ParamsGetDashboard; changeJustPaymentMethod: boolean }) {
    this.applyFilters(data.filters, data.changeJustPaymentMethod);
  }

  applyFilters(filters: ParamsGetDashboard, changeJustPaymentMethod: boolean) {
    this.loadingSummary.set(true);
    this.loadingProducts.set(true);
    this.loadingCharts.set(true);
    this.#dashboardService
      .getDashboardSummary(filters)
      .pipe(finalize(() => this.loadingSummary.set(false)))
      .subscribe({
        next: (response) => {
          this.dashboardSummary.set(response);
          if (changeJustPaymentMethod) {
            return;
          }
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

  #progressPercent(value: number, max: number): number {
    const parsedValue = this.safeProgressValue(value);
    const parsedMax = this.safeProgressValue(max);

    if (parsedValue <= 0 || parsedMax <= 0) return 0;

    return Math.min((parsedValue / parsedMax) * 100, 100);
  }

  animatedProgressPercent(value: number, max: number): number {
    if (!this.progressBarsReady()) return 0;

    return this.#progressPercent(value, max);
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

  progressBarClass(index: number): string {
    const gradients = [
      'bg-linear-to-r from-success to-emerald-400',
      'bg-linear-to-r from-primary to-secondary',
      'bg-linear-to-r from-info to-cyan-400',
      'bg-linear-to-r from-warning to-amber-400',
      'bg-linear-to-r from-accent to-teal-400',
      'bg-linear-to-r from-error to-rose-400',
    ];
    return gradients[index % gradients.length];
  }

  navigateToCashRegister(registerId: number) {
    this.#router.navigate(['view-cash-registers/cash-register', registerId]);
  }

  #maxOrDefault(values: number[]): number {
    const max = values.reduce((acc, value) => (value > acc ? value : acc), 0);
    return max > 0 ? max : 1;
  }

  #animateProgressBars() {
    this.progressBarsReady.set(false);
    clearTimeout(this.#progressAnimationTimeout);
    this.#progressAnimationTimeout = setTimeout(() => {
      this.progressBarsReady.set(true);
    }, 80);
  }
}
