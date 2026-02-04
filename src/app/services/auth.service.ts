import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

interface LoginResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private isLoggedIn = signal<boolean>(false);
  private token = signal<string | null>(null);

  login(document: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http
        .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { document, password })
        .subscribe({
          next: async (response: any) => {
            await window.electronAPI.saveToken(response.access_token);
            this.token.set(response.access_token);
            this.isLoggedIn.set(true);
            resolve(true);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  logout(): Promise<boolean> {
    return new Promise(async (resolve) => {
      await window.electronAPI.deleteToken();
      this.token.set(null);
      this.isLoggedIn.set(false);
      resolve(true);
    });
  }

  getIsLoggedIn(): boolean {
    return this.isLoggedIn();
  }

  async getAuthToken(): Promise<string | null> {
    this.token.set(await window.electronAPI.getToken());
    return this.token();
  }
}
