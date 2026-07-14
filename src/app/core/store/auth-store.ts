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
import { ToastService } from '../../shared/services/toast.service';
import { ElectronApiService } from '../services/electron-api.service';

type AuthState = {
  employee: Employee | null;
  officeIdFromCashRegister: number | null;
  loading: boolean;
};

const initialState: AuthState = {
  employee: null,
  officeIdFromCashRegister: null,
  loading: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authService: inject(AuthService),
    router: inject(Router),
    toastService: inject(ToastService),
    electronApi: inject(ElectronApiService),
  })),
  withComputed(({ employee }) => ({
    cashRegisterIsOpen: computed(() => employee()?.cashRegister),
    isAdmin: computed(() => employee()?.role === 'ADMIN'),
    isAuthenticated: computed(() => !!employee()),
  })),
  withMethods(({ authService, router, toastService, electronApi, ...store }) => ({
    login: rxMethod<{ document: string; password: string }>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(({ document, password }) =>
          authService.login(document, password).pipe(
            tap(({ user, access_token }) => {
              router.navigate(['/dashboard']);
              electronApi.saveToken(access_token);
              patchState(store, {
                employee: user,
                officeIdFromCashRegister: user.officeId ?? null,
              });
            }),
            catchError((err) => {
              if (err.status === 401 || err.status === 404) {
                toastService.show({
                  title: 'Inicio de sesión fallido',
                  content: 'Documento o contraseña incorrectos.',
                  type: 'error',
                });
              }
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
      await electronApi.deleteToken();
      try {
        localStorage.removeItem('billFilters');
        localStorage.removeItem('cashRegisterFilters');
      } catch (error) {
        console.error('Failed to clear filters from localStorage:', error);
      }
      patchState(store, { employee: null });
      router.navigate(['']);
    },

    async getToken() {
      return await electronApi.getToken();
    },
    resetOfficeIdFromCashRegister() {
      const officeIdFromCashRegister = store.officeIdFromCashRegister() ?? undefined;
      patchState(store, (state) => ({
        employee: state.employee
          ? {
              ...state.employee,
              officeIdFromCashRegister,
            }
          : null,
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
            catchError(() => {
              patchState(store, { employee: null });
              router.navigate(['']);
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
    setCashRegister(officeId: number, officeName: string, cashRegisterId: number) {
      patchState(store, (state) => ({
        employee: state.employee
          ? { ...state.employee, cashRegister: cashRegisterId, officeId, officeName }
          : null,
        officeIdFromCashRegister: officeId,
      }));
    },
    resetCashRegister() {
      if (store.isAdmin()) {
        patchState(store, (state) => ({
          employee: state.employee
            ? { ...state.employee, officeId: undefined, officeName: undefined }
            : null,
        }));
      }
      patchState(store, (state) => ({
        employee: state.employee ? { ...state.employee, cashRegister: 0 } : null,
        officeIdFromCashRegister: null,
      }));
    },
  })),
);
