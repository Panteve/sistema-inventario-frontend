import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { CashRegisterService } from '../services/cash-register.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, finalize, pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { CashRegisterSummaryResponse } from '../../../shared/interfaces/cash-register-interface';
import { AuthStore } from '../../../core/store/auth-store';
import { ToastService } from '../../../shared/services/toast.service';

type CashRegisterState = {
  loading: boolean;
  loadingSummary: boolean;
  cashRegisterSummary: CashRegisterSummaryResponse;
};

const initialState: CashRegisterState = {
  loading: false,
  loadingSummary: false,
  cashRegisterSummary: {
    openedAt: '',
    initialAmount: 0,
    totalCashSales: 0,
    totalTransferSales: 0,
    totalExpenses: 0,
  },
};

export const CashRegisterStore = signalStore(
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    toastService: inject(ToastService),
    cashRegisterService: inject(CashRegisterService),
    router: inject(Router),
  })),
  withMethods(({ authStore, toastService, cashRegisterService, router, ...store }) => ({
    openCashRegister: rxMethod<{ officeId: number; initialAmount: number }>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        filter((data) => {
          if (data.initialAmount <= 0) {
            toastService.show({
              title: 'Monto inicial no válido',
              content: 'El monto inicial no puede ser igual o menor a cero.',
              type: 'error',
            });
            patchState(store, { loading: false });
            return false;
          }
          return true;
        }),
        switchMap((data) => {
          return cashRegisterService
            .openCashRegister({ initialAmount: data.initialAmount, officeId: data.officeId })
            .pipe(
              tap((response) => {
                authStore.setCashRegister(response.office.id, response.office.name);
                toastService.show({
                  title: 'Caja abierta exitosamente',
                  content: 'La caja ha sido abierta, feliz día.',
                  type: 'success',
                });
                router.navigate([], {
                  queryParams: { cashModal: 'null' },
                  queryParamsHandling: 'merge',
                });
              }),
              catchError((err) => {
                if (err.status === 409) {
                  //MANEJAR MEJOR ESTE ERROR YA QUE PUEDE SER POR CAJA ABIERTA O POR ABIR CAJA SIN UNA OFICINA ASIGNADA
                  toastService.show({
                    title: 'Caja ya abierta',
                    content: 'Ya existe una caja abierta para este usuario.',
                    type: 'error',
                  });
                  return EMPTY;
                }
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, { loading: false });
              }),
            );
        }),
      ),
    ),
    getCashRegisterSummary: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loadingSummary: true });
        }),
        switchMap(() =>
          cashRegisterService.getCashRegisterSummary().pipe(
            tap((response) => {
              patchState(store, {
                cashRegisterSummary: response,
              });
            }),
            catchError((err) => {
              toastService.show({
                title: 'Fallo al obtener resumen de caja',
                content: 'Fallo al obtener resumen de caja, por favor intente de nuevo.',
                type: 'error',
              });
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loadingSummary: false });
            }),
          ),
        ),
      ),
    ),
    closeCashRegister: rxMethod<number>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((amountReceived) =>
          cashRegisterService.closeCashRegister(amountReceived).pipe(
            tap((response) => {
              authStore.resetCashRegister();
              toastService.show({
                title: 'Caja cerrada exitosamente',
                content: 'La caja ha sido cerrada correctamente.',
                type: 'success',
              });
              router.navigate([], {
                queryParams: { cashModal: 'null' },
                queryParamsHandling: 'merge',
              });
            }),
            catchError((err) => {
              console.error('Error closing cash register:', err);
              toastService.show({
                title: 'Fallo al cerrar caja',
                content: 'Fallo al cerrar caja, por favor intente de nuevo.',
                type: 'error',
              });
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, {
                loading: false,
              });
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      if(store.authStore.cashRegisterIsOpen()) {
        store.getCashRegisterSummary();
      }
    },
  }),
);
