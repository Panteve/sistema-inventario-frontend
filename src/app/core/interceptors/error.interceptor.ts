import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth-store';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';


// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 500) {
        toastService.show({
          content: 'Error del servidor. Por favor, inténtalo de nuevo más tarde.',
          type: 'error',
          title: 'Error del servidor',
        });
      } else if (err.status === 403) {
        toastService.show({
          content: 'No tienes permisos para esta acción.',
          type: 'error',
          title: 'Acceso denegado',
        });
      } else if (err.status === 401) {
        const isSessionCheck = req.url.includes('/auth/profile');
        if (!isSessionCheck) {
          toastService.show({
            title: 'Inicio de sesión requerido',
            content: 'No estás autenticado. Por favor, inicia sesión.',
            type: 'error',
          });
        }
        authStore.logout();
      } else if (err.status === 0) {
        toastService.show({
          title: 'Sin conexión al servidor',
          content: 'No hay conexión al servidor. Por favor, inténtalo de nuevo más tarde.',
          type: 'error',
        });
      }

      return throwError(() => err);
    }),
  );
};
