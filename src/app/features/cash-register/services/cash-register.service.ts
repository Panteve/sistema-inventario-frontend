import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CashRegisterResponse, CashRegisterSummaryResponse, OpenCashRegisterRequest } from '../../../shared/interfaces/cash-register-interface';

@Injectable({
  providedIn: 'root',
})
export class CashRegisterService {
  private http = inject(HttpClient)

  openCashRegister(openCashRegisterData: OpenCashRegisterRequest){
    return this.http.post<CashRegisterResponse>(`${environment.apiUrl}/cash-register/open`, openCashRegisterData);
  }
  closeCashRegister(amountReceived: number){
    return this.http.patch(`${environment.apiUrl}/cash-register/close`, { amountReceived });
  }
  getCashRegisterSummary(){
    return this.http.get<CashRegisterSummaryResponse>(`${environment.apiUrl}/cash-register/summary`);
  }


}
