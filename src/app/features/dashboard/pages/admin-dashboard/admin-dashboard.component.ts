import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  DashboardSummary,
  ParamsGetDashboard,
} from '../../../../shared/interfaces/dashboard.interfacce';
import { ToastService } from '../../../../shared/services/toast.service';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { DashboardService } from '../../services/dashboard.service';
import { AdminDashboardFiltersComponent } from '../../components/admin-dashboard-filters/admin-dashboard-filters.component';

@Component({
  selector: 'app-admin-dashboard.component',
  imports: [AdminDashboardFiltersComponent, DatePipe, CopPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  #toastService = inject(ToastService);
  #dashboardService = inject(DashboardService);
  #router = inject(Router);

  loading = signal<boolean>(false);
  dashboardSummary = signal<DashboardSummary>({
    totalSales: { current: 0, previous: 0, diff: 0, diffPercentage: 0 },
    totalBills: { current: 0, previous: 0, diff: 0, diffPercentage: 0 },
    averageBill: { current: 0, previous: 0, diff: 0, diffPercentage: 0 },
    activeOffices: 0,
    activeCashRegisters: [],
  });

  onFiltersChange(filters: ParamsGetDashboard) {
    this.applyFilters(filters);
  }

  applyFilters(filters: ParamsGetDashboard) {
    this.loading.set(true);
    this.#dashboardService
      .getDashboardSummary(filters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.dashboardSummary.set(response);
        },
        error: () => {
          this.#toastService.show({
            title: 'Error',
            content: 'Error al obtener el resumen del dashboard. Por favor, inténtalo de nuevo.',
            type: 'error',
          });
        },
      });
  }

  navigateToCashRegister(registerId: number) {
    this.#router.navigate(['view-cash-registers/cash-register', registerId]);
  }
}
