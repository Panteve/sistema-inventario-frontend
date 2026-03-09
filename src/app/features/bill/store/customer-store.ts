import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { CustomerService } from '../services/customer.service';
import { ErrorStore } from '../../../core/store/errors-store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '../../../shared/interfaces/customer-interface';

type CustomerState = {
  customer: CreateCustomerRequest | null;
  newCustomer: boolean;
  editarClienteActivo: boolean;
  loading: boolean;
};

const initialState: CustomerState = {
  editarClienteActivo: false,
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
        tap(() => patchState(store, { loading: true, customer: null, newCustomer: false })),
        switchMap((document) =>
          customerService.searchCustomerByDoc(document).pipe(
            tap((customer) => {
              errorStore.clearError();
              patchState(store, { customer });
            }),
            catchError((error) => {
              if (error.status === 404) {
                errorStore.showError(
                  'No se encontró un cliente con ese documento, por favor ingrese los datos para crearlo.',
                );
                patchState(store, { newCustomer: true });
              }
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
    createCustomer: rxMethod<CreateCustomerRequest>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((customerData) =>
          customerService.createCustomer(customerData).pipe(
            tap((customer) => {
              errorStore.clearError();
              patchState(store, { customer, newCustomer: false });
              errorStore.showError('Cliente creado exitosamente');
            }),
            catchError((error) => {
              if (error.status === 400) {
                patchState(store, { newCustomer: true });
                errorStore.showError('Error al crear el cliente. Verifique los datos ingresados.');
              }
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
    updateCustomer: rxMethod<{ document: string; customerData: UpdateCustomerRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(({ document, customerData }) =>
          customerService.updateCustomerByDoc(document, customerData).pipe(
            tap((customer) => {
              errorStore.showError('Cliente actualizado exitosamente');
              patchState(store, { customer, editarClienteActivo: false });
            }),
            catchError((error) => {
              if (error.status === 400) {
                errorStore.showError(
                  'Error al actualizar el cliente. Verifique los datos ingresados.',
                );
              }
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
    changeEditarClienteActivo(value: boolean) {
      patchState(store, { editarClienteActivo: value });
    },
    clearCustomer() {
      errorStore.clearError();
      patchState(store, { customer: null, newCustomer: false });
    },
  })),
);
