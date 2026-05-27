import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DashboardSummary, ParamsGetDashboard } from '../../../shared/interfaces/dashboard.interfacce';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  #http = inject(HttpClient);

  getDashboardSummary(params: ParamsGetDashboard) {
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
    return this.#http.get<DashboardSummary>(`${environment.apiUrl}/dashboard`, {
      params: queryParams,
    });
  }
}
