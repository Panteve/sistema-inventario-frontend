import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStore } from '../store/auth-store';
import { NgFastToastService } from 'ng-fast-toast';
import { catchError, throwError } from 'rxjs';

// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const toastNotification = inject(NgFastToastService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 500) {
        toastNotification.error({
          title: 'Error interno del servidor',
          content: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
          duration: 7,
        });
      } else if (err.status === 403) {
        toastNotification.error({
          title: 'Acceso denegado',
          content: 'No tienes permisos para esta acción.',
          duration: 5,
        });
      } else if (err.status === 401) {
        toastNotification.error({
          title: 'Inicio de sesión requerido',
          content: 'No estás autenticado. Por favor, inicia sesión.',
          duration: 5,
        });
        authStore.logout();
      } else if (err.status === 0) {
        toastNotification.error({
          title: 'Sin conexión al servidor',
          content: 'No hay conexión al servidor. Por favor, inténtalo de nuevo más tarde.',
          duration: 7,
        });
      }
      return throwError(() => err); // relanza para que cada store lo maneje también
    }),
  );
};
