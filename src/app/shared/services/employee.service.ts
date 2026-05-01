import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateEmployeeRequest, EmployeeResponse, EmployeesByOfficeResponse, UpdateEmployeeRequest } from '../interfaces/employee.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);

  getEmployeesByOffice(officeId: number) {
    return this.http.get<EmployeesByOfficeResponse[]>(`${environment.apiUrl}/employees/by-office/${officeId}`);
  }

  getAllEmployees() {
    return this.http.get<EmployeeResponse[]>(`${environment.apiUrl}/employees`);
  }
  createEmployee(employeeData: CreateEmployeeRequest) {
    return this.http.post(`${environment.apiUrl}/employees/employee`, employeeData);
  }
  updateEmployee(employeeId: number, employeeData: UpdateEmployeeRequest) {

    return this.http.patch(`${environment.apiUrl}/employees/update/${employeeId}`, employeeData);
  }
  updateEmployeePassword(employeeId: number, newPassword: string) {
    return this.http.patch(`${environment.apiUrl}/employees/employee/${employeeId}/password`, { newPassword });
  }
  setStatus(employeeId: number, status: boolean) {
    return this.http.patch(`${environment.apiUrl}/employees/employee/${employeeId}`, { status });
  }
}
