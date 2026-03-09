import { HttpInterceptorFn } from '@angular/common/http';
import { ErrorStore } from '../store/errors-store';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../store/auth-store';

// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorStore = inject(ErrorStore);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 500) {
        errorStore.showError('Error interno del servidor');
      } else if (err.status === 403) {
        errorStore.showError('No tienes permisos para esta acción');
      } else if (err.status === 401) {
        authStore.logout();
        errorStore.showError('No estás autenticado. Por favor, inicia sesión.');
      } else if (err.status === 0) {
        errorStore.showError('Sin conexión al servidor');
      }
      return throwError(() => err); // relanza para que cada store lo maneje también
    }),
  );
};
