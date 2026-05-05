import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OfficeNameIdResponse } from '../interfaces/office.interface';

@Injectable({
  providedIn: 'root',
})
export class OfficeService {
  #http = inject(HttpClient);

  getOffices() {
    return this.#http.get<OfficeNameIdResponse[]>(`${environment.apiUrl}/offices/names/all`);
  }
}
