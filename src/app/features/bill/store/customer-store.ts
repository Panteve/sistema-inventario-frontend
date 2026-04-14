import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { CustomerService } from '../services/customer.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '../../../shared/interfaces/customer-interface';
import { NgFastToastService } from 'ng-fast-toast';

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
    toastNotification: inject(NgFastToastService),
  })),
  withMethods(({ customerService, toastNotification, ...store }) => ({
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
                queueMicrotask(() => {
                  toastNotification.warn({
                    title: 'Cliente no encontrado',
                    content:
                      'No se encontró un cliente con ese documento, por favor ingrese los datos para crearlo.',
                    duration: 5,
                  });
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
              queueMicrotask(() => {
                toastNotification.success({
                  title: 'Cliente creado',
                  content: 'El cliente ha sido creado exitosamente.',
                  duration: 5,
                });
              });
            }),
            catchError((error) => {
              if (error.status === 400) {
                patchState(store, { newCustomer: true });
                queueMicrotask(() => {
                  toastNotification.error({
                    title: 'Error al crear el cliente',
                    content: 'Verifique los datos ingresados.',

                    duration: 5,
                  });
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
              queueMicrotask(() => {
                toastNotification.success({
                  title: 'Cliente actualizado',
                  content: 'El cliente ha sido actualizado exitosamente.',
                  duration: 5,
                });
              });
              patchState(store, { customer, editarClienteActivo: false });
            }),
            catchError((error) => {
              if (error.status === 400) {
                queueMicrotask(() => {
                  toastNotification.error({
                    title: 'Error al actualizar el cliente',
                    content: 'Verifique los datos ingresados.',
                    duration: 5,
                  });
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
