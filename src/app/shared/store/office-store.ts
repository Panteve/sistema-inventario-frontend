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
import { ErrorStore } from '../../core/store/errors-store';
import { OfficeService } from '../services/office.service';
import { OfficeNameIdResponse } from '../interfaces/office.interface';

type ProductState = {
  offices: OfficeNameIdResponse[];
  loading: boolean;
};

const initialState: ProductState = {
  offices: [],
  loading: false,
};
export const OfficeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    officeService: inject(OfficeService),
    errorStore: inject(ErrorStore),
  })),
  withMethods(({ authStore, officeService, errorStore, ...store }) => ({
    loadOffices: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          officeService.getOffices().pipe(
            tap((offices) => {
              patchState(store, { offices });
            }),
            catchError((err) => {
              errorStore.showError(
                'Error al cargar las sucursales. Por favor, inténtelo de nuevo más tarde.',
              );
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
);
