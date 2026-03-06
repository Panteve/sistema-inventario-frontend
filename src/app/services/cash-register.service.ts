import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CashRegisterResponse, OpenCashRegisterRequest } from '../interfaces/cash-register-interface';

@Injectable({
  providedIn: 'root',
})
export class CashRegisterService {
  private http = inject(HttpClient)

  openCashRegister(openCashRegisterData: OpenCashRegisterRequest){
    return this.http.post<CashRegisterResponse>(`${environment.apiUrl}/api/cash-register/open`, openCashRegisterData);
  }

  closeCashRegister(cashRegisterId: number){
    return this.http.patch(`${environment.apiUrl}/api/cash-register/close${cashRegisterId}`, {});
  }

  getCashRegisterSummary(cashRegisterId: number){
    return this.http.get(`${environment.apiUrl}/api/cash-register/${cashRegisterId}/summary`);
  }


}
