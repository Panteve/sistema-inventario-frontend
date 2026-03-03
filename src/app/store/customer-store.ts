import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { CustomerService } from '../services/customer.service';
import { ErrorStore } from './errors-store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap, throwError } from 'rxjs';
import { CreateCustomerRequest } from '../interfaces/customer-interface';

type CustomerState = {
  customer: CreateCustomerRequest | null;
  newCustomer: boolean;
  loading: boolean;
};

const initialState: CustomerState = {
  newCustomer: false,
  customer: null,
  loading: false,
};

export const CustomerStore = signalStore(
  withState(initialState),
  withProps(() => ({
    customerService: inject(CustomerService),
    errorStore: inject(ErrorStore),
  })),
  withMethods(({ customerService, errorStore, ...store }) => ({
    searchCustomer: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((document) =>
          customerService.searchCustomer(document).pipe(
            tap((customer) => {
              patchState(store, { customer });
            }),
            catchError((error) => {
              patchState(store, { newCustomer: true });
              errorStore.showError('No se encontró un cliente con ese documento.');
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
  })),
);
