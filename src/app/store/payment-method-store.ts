import { patchState, signalStore, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PaymentMethodResponse } from '../interfaces/paymentMethod.interface';
import { inject } from '@angular/core';
import { ErrorStore } from './errors-store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { PaymentMethodService } from '../services/payment-method.service';
import { finalize, pipe, switchMap, tap } from 'rxjs';

type PaymentMethodState = {
  paymentMethods: PaymentMethodResponse[];
  loading: boolean;
};

const initialState: PaymentMethodState = {
  paymentMethods: [],
  loading: false,
};

export const PaymentMethodStore = signalStore(
  withState(initialState),
  withProps(() => ({
    errorStore: inject(ErrorStore),
    paymentMethodService: inject(PaymentMethodService),
  })),

  withMethods(({ errorStore, paymentMethodService, ...store }) => ({
    loadPaymentMethods: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(() =>
          paymentMethodService.loadPaymentMethods().pipe(
            tap((paymentMethods) => {
              patchState(store, { paymentMethods, loading: false });
            }),
          ),
        ),
        finalize(() => patchState(store, { loading: false })),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadPaymentMethods();
    },
  })
);
