import {
  patchState,
  signalStore,
  type,
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
import { entityConfig, setAllEntities, withEntities } from '@ngrx/signals/entities';

type PaymentMethodState = {
  loading: boolean;
};

const initialState: PaymentMethodState = {
  loading: false,
};

const PaymentMethodResponseConfig = entityConfig({
  entity: type<PaymentMethodResponse>(),
  collection: 'paymentMethods',
  selectId: (paymentMethod) => paymentMethod.id,
});

export const PaymentMethodStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    paymentMethodService: inject(PaymentMethodService),
    toastService: inject(ToastService),
  })),
  withEntities(PaymentMethodResponseConfig),
  withMethods(({ paymentMethodService, toastService, ...store }) => {
    const _loadPaymentMethodsTrigger = rxMethod<boolean>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((showDelete) =>
          paymentMethodService.loadPaymentMethods(showDelete).pipe(
            tap((paymentMethods) => {
              patchState(store, setAllEntities(paymentMethods, PaymentMethodResponseConfig));
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
    );
    return {
      loadPaymentMethods(showDelete = false) {
        _loadPaymentMethodsTrigger(showDelete);
      },
    };
  }),
  withHooks({
    onInit(store) {
      store.loadPaymentMethods();
    },
  }),
);
