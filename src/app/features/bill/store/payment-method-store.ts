import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { PaymentMethodResponse } from '../../../shared/interfaces/paymentMethod.interface';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { PaymentMethodService } from '../services/payment-method.service';
import { catchError, finalize, pipe, switchMap, tap } from 'rxjs';
import { NgFastToastService } from 'ng-fast-toast';

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
    paymentMethodService: inject(PaymentMethodService),
    toastNotification: inject(NgFastToastService),
  })),

  withMethods(({ paymentMethodService, toastNotification, ...store }) => ({
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
            catchError((error) => {
              queueMicrotask(() => {
                toastNotification.error({
                  title: 'Error al cargar métodos de pago',
                  content: 'No se pudieron cargar los métodos de pago. Inténtalo de nuevo.',
                  duration: 5,
                });
              });
              return [];
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
