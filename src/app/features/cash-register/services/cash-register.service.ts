import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  PostCashRegisterResponse,
  CashRegisterSummaryResponse,
  OpenCashRegisterRequest,
  CashRegisterHistoryResponse,
  ParamsGetCashRegisters,
  CashRegisterFullHistoryResponse,
} from '../../../shared/interfaces/cash-register-interface';

@Injectable({
  providedIn: 'root',
})
export class CashRegisterService {
  #http = inject(HttpClient);

  openCashRegister(openCashRegisterData: OpenCashRegisterRequest) {
    return this.#http.post<PostCashRegisterResponse>(
      `${environment.apiUrl}/cash-register/open`,
      openCashRegisterData,
    );
  }
  closeCashRegister(amountReceived: number) {
    return this.#http.patch(`${environment.apiUrl}/cash-register/close`, { amountReceived });
  }
  getCashRegisterSummary() {
    console.log('Fetching cash register summary...');
    return this.#http.get<CashRegisterSummaryResponse>(
      `${environment.apiUrl}/cash-register/summary`,
    );
  }

  getCashRegisterHistory(id: number) {
    return this.#http.get<CashRegisterFullHistoryResponse>(`${environment.apiUrl}/cash-register/history/${id}`);
  }

  getAllCashRegisters(params: ParamsGetCashRegisters) {
    const queryParams: any = {
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      limit: params.limit,
    };

    if (params.officeId !== undefined) {
      queryParams.officeId = params.officeId;
    }
    if (params.employeeId !== undefined) {
      queryParams.employeeId = params.employeeId;
    }
    if (params.status !== undefined) {
      queryParams.status = params.status;
    }

    return this.#http.get<CashRegisterHistoryResponse>(`${environment.apiUrl}/cash-register`, {
      params: queryParams,
    });
  }
}
