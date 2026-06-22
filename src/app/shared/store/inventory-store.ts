import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  ProductOnInventoryResponse,
} from '../interfaces/product.interface';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { ProductService } from '../services/product.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { ToastService } from '../services/toast.service';
import { InventoryService } from '../services/inventory.service';

type InventoryState = {
  products: ProductOnInventoryResponse[];
  modalClose: boolean;
  loading: boolean;
};

const initialState: InventoryState = {
  products: [],
  modalClose: false,
  loading: false,
};
export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    inventoryService: inject(InventoryService),
    toastService: inject(ToastService),
  })),
  withMethods(({ authStore, inventoryService, toastService, ...store }) => ({
    loadProductsOnInventory: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          inventoryService.loadInventory().pipe(
            tap((products) => {
              patchState(store, { products });
            }),
            catchError((err) => {
              toastService.show({
                title: 'Error al cargar productos',
                content: 'No se pudieron cargar los productos. Inténtalo de nuevo.',
                type: 'error',
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
      toObservable(computed(() => store.authStore.employee()?.officeId))
        .pipe(
          distinctUntilChanged(),
          filter((id) => !!id),
        )
        .subscribe(() => {
          store.loadProductsOnInventory();
        });
    },
  }),
);
