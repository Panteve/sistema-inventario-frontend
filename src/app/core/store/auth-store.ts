import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
  withComputed,
  withProps,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import type { Employee } from '../../shared/interfaces/Auth.interface';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { NgFastToastService } from 'ng-fast-toast';

type AuthState = {
  employee: Employee | null;
  loading: boolean;
};

const initialState: AuthState = {
  employee: null,
  loading: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ employee }) => ({
    isAdmin: computed(() => employee()?.role === 'ADMIN'),
    isAuthenticated: computed(() => !!employee()),
  })),
  withProps(() => ({
    authService: inject(AuthService),
    router: inject(Router),
    toastNotification: inject(NgFastToastService),
  })),
  withMethods(({ authService, router, toastNotification, ...store }) => ({
    login: rxMethod<{ document: string; password: string }>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(({ document, password }) =>
          authService.login(document, password).pipe(
            tap(({ user, access_token }) => {
              window.electronAPI.saveToken(access_token);
              patchState(store, {
                employee: user,
              });
              router.navigate(['/dashboard']);
            }),
            catchError((err) => {
              if (err.status === 401 || err.status === 404) {
                toastNotification.error({
                  title: 'Inicio de sesión fallido',
                  content: 'Documento o contraseña incorrectos.',
                  duration: 5,
                });
              }
              patchState(store, { loading: false });
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
          ),
        ),
      ),
    ),

    async logout() {
      await window.electronAPI.deleteToken();
      patchState(store, { employee: null });
      router.navigate(['']);
    },

    async getToken() {
      return await window.electronAPI.getToken();
    },
    //DEPURACION SOLO PARA PROBAR FUNCIONALIDAD DE ADMINISTRADOR
    changeAdminStatus() {
      patchState(store, (state) => ({
        employee:
          state.employee?.role === 'ADMIN'
            ? { ...state.employee, role: 'USER' }
            : ({ ...state.employee, role: 'ADMIN' } as Employee),
      }));
    },

    setOfficeId(officeId: number) {
      patchState(store, (state) => ({
        employee: state.employee ? { ...state.employee, officeId } : null,
      }));

    },
    checkSession: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          authService.me().pipe(
            tap((response) => {
              patchState(store, {
                employee: response,
              });
              router.navigate(['/dashboard']);
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
            catchError(() => {
              patchState(store, { employee: null, loading: false });
              router.navigate(['']);
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
    setCashRegisterId(cashRegisterId: number) {
      patchState(store, (state) => ({
        employee: state.employee ? { ...state.employee, cashRegisterId } : null,
      }));
    },
    setOfficeName(officeName: string) {
      patchState(store, (state) => ({
        employee: state.employee ? { ...state.employee, officeName } : null,
      }));
    },
  })),
);
