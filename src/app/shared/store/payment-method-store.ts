import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { PaymentMethodResponse } from '../interfaces/paymentMethod.interface';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { PaymentMethodService } from '../services/payment-method.service';

type PaymentMethodState = {
  paymentMethods: PaymentMethodResponse[];
  loading: boolean;
};

const initialState: PaymentMethodState = {
  paymentMethods: [],
  loading: false,
};

export const PaymentMethodStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    paymentMethodService: inject(PaymentMethodService),
    toastService: inject(ToastService),
  })),

  withMethods(({ paymentMethodService, toastService, ...store }) => ({
    loadPaymentMethods: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(() =>
          paymentMethodService.loadPaymentMethods().pipe(
            tap((paymentMethods) => {
              patchState(store, { paymentMethods });
            }),
            catchError((error) => {
              toastService.show({
                title: 'Error al cargar métodos de pago',
                content: 'No se pudieron cargar los métodos de pago. Inténtalo de nuevo.',
                type: 'error',
              });
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadPaymentMethods();
    },
  }),
);
