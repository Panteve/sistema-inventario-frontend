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
import { ErrorStore } from './errors-store';
import { CashRegisterStore } from '../../features/cash-register/store/cash-register-store';

type AuthState = {
  employee: Employee | null;
  isAuthenticated: boolean;
  loading: boolean;
};

const initialState: AuthState = {
  employee: null,
  isAuthenticated: false,
  loading: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ employee }) => ({
    isAdmin: computed(() => employee()?.role === 'ADMIN'),
  })),
  withProps(() => ({
    authService: inject(AuthService),
    cashRegisterStore: inject(CashRegisterStore),
    router: inject(Router),
    errorStore: inject(ErrorStore),
  })),
  withMethods(({ authService, cashRegisterStore, router, errorStore, ...store }) => ({
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
                isAuthenticated: true,
              });
              router.navigate(['/dashboard']);
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
            catchError((err) => {
              if (err.status === 401 || err.status === 404) {
                errorStore.showError('Documento o contraseña incorrectos.');
              }
              patchState(store, { loading: false });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    async logout() {
      await window.electronAPI.deleteToken();
      patchState(store, { employee: null, isAuthenticated: false });
      router.navigate(['']);
    },

    async getToken() {
      return await window.electronAPI.getToken();
    },

    checkSession: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          authService.me().pipe(
            tap((response) => {
              patchState(store, {
                employee: response,
                isAuthenticated: true,
              });
              if (response.cashRegisterId?.id) {
                cashRegisterStore.setCashRegisterId(response.cashRegisterId.id);
              }

              router.navigate(['/dashboard']);
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
            catchError(() => {
              patchState(store, { employee: null, loading: false, isAuthenticated: false });
              router.navigate(['']);
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
