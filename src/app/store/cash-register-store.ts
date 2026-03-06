import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { ErrorStore } from './errors-store';
import { computed, inject } from '@angular/core';
import { CashRegisterService } from '../services/cash-register.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

type CashRegisterState = {
  loading: boolean;
  amountReceived: number;
  cashRegisterId: number;

};

const initialState: CashRegisterState = {
  loading: false,
  amountReceived: 0,
  cashRegisterId: 0,
};

export const CashRegisterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ cashRegisterId }) => ({
    cashRegisterOpen: computed(() => cashRegisterId() === 0),
  })),
  withProps(() => ({
    erorrStore: inject(ErrorStore),
    cashRegister: inject(CashRegisterService),
    router: inject(Router),
  })),
  withMethods(({ erorrStore, cashRegister, router, ...store }) => ({
    openCashRegister: rxMethod<number>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((initialAmount) =>
          cashRegister.openCashRegister({ initialAmount }).pipe(
            tap((response) => {
              patchState(store, { loading: false, cashRegisterId: response.id });
              erorrStore.showError('Caja abierta exitosamente');
              router.navigate([], {
                queryParams: { cashModal: 'null' },
                queryParamsHandling: 'merge',
              });
            }),
          ),
        ),
        finalize(() => {
          patchState(store, { loading: false });
          return true;
        }),
        catchError((err) => {
          erorrStore.showError('Fallo al abrir caja, por favor intente de nuevo.');
          return EMPTY;
        }),
      ),
    ),
  })),
);
