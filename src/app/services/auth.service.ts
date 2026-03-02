import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginResponse, Employee } from '../interfaces/Auth.interface';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(document: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      document,
      password,
    })
  }

  me(){
    return this.http.get<Employee>(`${environment.apiUrl}/auth/profile`);
  }

}
