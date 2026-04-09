import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EmployeesByOfficeResponse } from '../interfaces/employee.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  getEmployeesByOffice(officeId: number) {
    return this.http.get<EmployeesByOfficeResponse[]>(`${environment.apiUrl}/employees/by-office/${officeId}`);
  }
}
