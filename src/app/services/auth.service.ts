import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

interface LoginResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http = inject(HttpClient);
  private token = signal<string | null>(null);

   login(document: string, password: string): boolean{
    this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { document, password }).subscribe({
      next: async (response: any) => {
        await window.electronAPI.saveToken(response.access_token);
      },
      error: (err) => {
        console.error('Login error', err);
      },
    });
    if (!this.token()) {
      return false;
    }
    return true;
  }

  async getAuthToken(): Promise<string | null> {
    this.token.set(await window.electronAPI.getToken());
    return this.token();
  }
}
