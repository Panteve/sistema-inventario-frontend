import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { OfficeService } from '../services/office.service';
import { OfficeNameIdResponse } from '../interfaces/office.interface';
import { NgFastToastService } from 'ng-fast-toast';

type OfficeState = {
  offices: OfficeNameIdResponse[];
  loading: boolean;
};

const initialState: OfficeState = {
  offices: [],
  loading: false,
};
export const OfficeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    officeService: inject(OfficeService),
    toastNotification: inject(NgFastToastService),
  })),
  withMethods(({ authStore, officeService, toastNotification, ...store }) => ({
    loadOffices: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          officeService.getOffices().pipe(
            tap((offices) => {
              patchState(store, { offices });
            }),
            catchError((err) => {
              queueMicrotask(() => {
                toastNotification.error({
                  title: 'Error',
                  content: 'Error al cargar las sucursales.',
                  duration: 5,
                });
              });
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      if (store.authStore.isAdmin()) {
        store.loadOffices();
      }
    },
  }),
);
