import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateOfficeRequest, OfficeNameIdResponse, OfficeResponse } from '../interfaces/office.interface';

@Injectable({
  providedIn: 'root',
})
export class OfficeService {
  #http = inject(HttpClient);


  getOffices() {
    return this.#http.get<OfficeResponse[]>(`${environment.apiUrl}/offices`);
  }

  getNameOffices() {
    return this.#http.get<OfficeNameIdResponse[]>(`${environment.apiUrl}/offices/names/all`);
  }

  setStatusOffice(id: number, status: boolean) {
    return this.#http.patch(`${environment.apiUrl}/offices/delete/${id}`, { status });
  }

  updateOffice(id: number, payload: Partial<CreateOfficeRequest>) {
    return this.#http.patch(`${environment.apiUrl}/offices/update/${id}`, payload);
  }
  createOffice(office: CreateOfficeRequest){
    office.companyId = 1;
    return this.#http.post(`${environment.apiUrl}/offices/create`, office );
  }
}
