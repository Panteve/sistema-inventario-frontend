import {
  patchState,
  signalStore,
  type,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { PaymentMethodResponse } from '../interfaces/paymentMethod.interface';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { PaymentMethodService } from '../services/payment-method.service';
import {
  entityConfig,
  setAllEntities,
  withEntities,
  updateEntity,
  prependEntity,
} from '@ngrx/signals/entities';

type PaymentMethodState = {
  showingInactive: boolean;
  loading: boolean;
};

const initialState: PaymentMethodState = {
  showingInactive: false,
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
  withComputed(({ paymentMethodsEntities, showingInactive }) => ({
    paymentMethods: computed(() => {
      if (showingInactive()) {
        return paymentMethodsEntities().filter((pm) => !pm.status);
      }
      return paymentMethodsEntities().filter((pm) => pm.status);
    }),
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
    ),
    setShowingInactive(showingInactive: boolean) {
      patchState(store, { showingInactive });
    },
    changePaymentMethodOnCatalog(paymentMethod: PaymentMethodResponse) {
      patchState(
        store,
        updateEntity(
          {
            id: paymentMethod.id,
            changes: { ...paymentMethod },
          },
          PaymentMethodResponseConfig,
        ),
      );
    },
    addPaymentMethodOnCatalog(paymentMethod: PaymentMethodResponse) {
      patchState(store, prependEntity(paymentMethod, PaymentMethodResponseConfig));
    },
  })),
  withHooks({
    onInit(store) {
      store.loadPaymentMethods();
    },
  }),
);
