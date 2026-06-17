import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  DashboardCharts,
  DashboardTables,
  DashboardSummary,
  ParamsGetDashboard,
} from '../../../shared/interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  #http = inject(HttpClient);

  #setQueryParams(params: ParamsGetDashboard) {
    const queryParams: any = {
      startDate: params.startDate,
      endDate: params.endDate,
    };
    if (params.officeId) {
      queryParams.officeId = params.officeId;
    }
    if (params.employeeId) {
      queryParams.employeeId = params.employeeId;
    }
    if (params.paymentMethodId) {
      queryParams.paymentMethodId = params.paymentMethodId;
    }
    return queryParams;
  }

  getDashboardSummary(params: ParamsGetDashboard) {
    const queryParams = this.#setQueryParams(params);
    return this.#http.get<DashboardSummary>(`${environment.apiUrl}/dashboard`, {
      params: queryParams,
    });
  }

  getDashboardTables(params: ParamsGetDashboard) {
    const queryParams = this.#setQueryParams(params);
    return this.#http.get<DashboardTables>(`${environment.apiUrl}/dashboard/tables`, {
      params: queryParams,
    });
  }

  getDashboardCharts(params: ParamsGetDashboard) {
    const queryParams = this.#setQueryParams(params);
    return this.#http.get<DashboardCharts>(`${environment.apiUrl}/dashboard/charts`, {
      params: queryParams,
    });
  }
}
