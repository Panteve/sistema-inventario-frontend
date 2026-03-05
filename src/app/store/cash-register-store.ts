import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { ErrorStore } from './errors-store';
import { inject } from '@angular/core';
import { CashRegisterService } from '../services/cash-register.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

type CashRegisterState = {
  loading: boolean;
  amountReceived: number;
  cashRegisterId?: number;
};

const initialState: CashRegisterState = {
  loading: false,
  amountReceived: 0,
};

export const CashRegisterStore = signalStore(
  withState(initialState),
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
              router.navigate(['/dashboard']);
            }),
          ),
        ),
        finalize(() => {
          patchState(store, { loading: false });
        }),
        catchError((err) => {
          erorrStore.showError('Failed to open cash register. Please try again.');
          return EMPTY;
        }),
      ),
    ),
  })),
);
