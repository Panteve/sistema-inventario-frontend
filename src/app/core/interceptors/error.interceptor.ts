import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStore } from '../store/auth-store';
import { NgFastToastService } from 'ng-fast-toast';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service.ts';

// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const toastNotification = inject(NgFastToastService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 500) {
        toastService.show({
          message: 'Error del servidor. Por favor, inténtalo de nuevo más tarde.',
          type: 'error',
          duration: 5000,
          title: 'Error del servidor',
        });
      } else if (err.status === 403) {
        toastService.show({
          message: 'Error del servidor. Por favor, inténtalo de nuevo más tarde.',
          type: 'error',
          duration: 5000,
          title: 'Acceso denegado',
        });
        queueMicrotask(() => {
          toastNotification.error({
            title: 'Acceso denegado',
            content: 'No tienes permisos para esta acción.',
            duration: 5,
          });
        });
      } else if (err.status === 401) {
        toastService.show({
          message: 'Error del servidor. Por favor, inténtalo de nuevo más tarde.',
          type: 'error',
          duration: 5000,
          title: 'Error de autenticación',
        });
        const isSessionCheck = req.url.includes('/auth/profile');

        if (!isSessionCheck) {
          queueMicrotask(() => {
            toastNotification.error({
              title: 'Inicio de sesión requerido',
              content: 'No estás autenticado. Por favor, inicia sesión.',
              duration: 5,
            });
          });
        }

        authStore.logout();
      } else if (err.status === 0) {
        toastService.show({
          title: 'Sin conexión al servidor',
          message: 'No hay conexión al servidor. Por favor, inténtalo de nuevo más tarde.',
          type: 'error',
        });
        queueMicrotask(() => {
          toastNotification.error({
            title: 'Sin conexión al servidor',
            content: 'No hay conexión al servidor. Por favor, inténtalo de nuevo más tarde.',
            duration: 7,
          });
        });
      }

      return throwError(() => err);
    }),
  );
};
