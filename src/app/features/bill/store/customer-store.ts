import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { CustomerService } from '../services/customer.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '../../../shared/interfaces/customer-interface';
import { ToastService } from '../../../shared/services/toast.service';

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
    toastService: inject(ToastService),
  })),
  withMethods(({ customerService, toastService, ...store }) => ({
    searchCustomer: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, customer: null, newCustomer: false })),
        switchMap((document) =>
          customerService.searchCustomerByDoc(document).pipe(
            tap((customer) => {
              patchState(store, { customer });
            }),
            catchError((error) => {
              if (error.status === 404) {
                toastService.show({
                  title: 'Cliente no encontrado',
                  content:
                    'No se encontró un cliente con ese documento, por favor ingrese los datos para crearlo.',
                  type: 'warning',
                });
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
              patchState(store, { customer, newCustomer: false });
              toastService.show({
                title: 'Cliente creado',
                content: 'El cliente ha sido creado exitosamente.',
                type: 'success',
              });
            }),
            catchError((error) => {
              if (error.status === 400) {
                patchState(store, { newCustomer: true });
                toastService.show({
                  title: 'Error al crear el cliente',
                  content: 'Verifique los datos ingresados.',
                  type: 'error',
                });
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
              toastService.show({
                title: 'Cliente actualizado',
                content: 'El cliente ha sido actualizado exitosamente.',
                type: 'success',
              });
              patchState(store, { customer, editarClienteActivo: false });
            }),
            catchError((error) => {
              if (error.status === 400) {
                toastService.show({
                  title: 'Error al actualizar el cliente',
                  content: 'Verifique los datos ingresados.',
                  type: 'error',
                });
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
      patchState(store, { customer: null, newCustomer: false });
    },
  })),
);
