import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginResponseInterface } from '../interfaces/login-response.interface';
import { UserInterface } from '../interfaces/employee.interface';
import { from, map, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private isLoggedIn = computed(() => this.isAuthenticated() && this.showNav());
  //recoverySessionSignal = signal<boolean>(false);
  showNav = signal<boolean>(false);
  private isAuthenticated = signal<boolean>(false);
  private isAdmin = signal<boolean>(false);
  private employee: UserInterface = { id: 0, document: '' };

  /*
  async recoverSession() {
    const token = await window.electronAPI.getToken();
    if (!token) {
      return;
    }
    return this.http.get<any>(`${environment.apiUrl}/auth/profile`).subscribe({
      next: (response) => {
        this.isAdmin.set(response.role?.toUpperCase() === 'ADMIN');

        this.employee = {
          id: response.id,
          document: response.document,
        };
        this.isAuthenticated.set(true);
        this.showNav.set(true);
        this.recoverySessionSignal.set(true);
        console.log('Session recovered successfully');
      },
      error: (err) => {
        console.error('Error recovering session:', err);
      }
    });
  }
  */
  login(document: string, password: string) {
    return this.http
      .post<LoginResponseInterface>(`${environment.apiUrl}/auth/login`, { document, password })
      .pipe(
        switchMap((response) =>
          from(window.electronAPI.saveToken(response.access_token)).pipe(
            tap(() => {
              this.isAdmin.set(response.user.role?.toUpperCase() === 'ADMIN');

              this.employee = {
                id: response.user.id,
                document: response.user.document,
              };

              this.isAuthenticated.set(true);
            }),
            map(() => true),
          ),
        ),
      );
  }

  logout(): Promise<boolean> {
    return new Promise(async (resolve) => {
      this.isAuthenticated.set(false);
      this.employee = { id: 0, document: '' };
      window.electronAPI.deleteToken();
      resolve(true);
    });
  }

  getIsLoggedIn(): boolean {
    return this.isLoggedIn();
  }

  getIsAdmin(): boolean {
    return this.isAdmin();
  }
  getEmployeeId(): number {
    return this.employee.id;
  }
  getEmployeeDocument(): string {
    return this.employee.document;
  }

  getAuthToken(): Promise<string | null> {
    return new Promise(async (resolve) => {
      const token = await window.electronAPI.getToken();
      resolve(token);
    });
  }
}
