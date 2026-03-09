import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { ProductResponse } from '../../../shared/interfaces/product.interface';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { AuthStore } from '../../../core/store/auth-store';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ProductService } from '../services/product.service';
import { ErrorStore } from '../../../core/store/errors-store';

type ProductState = {
  products: ProductResponse[];
  modalClose: boolean;
  loading: boolean;
};

const initialState: ProductState = {
  products: [],
  modalClose: false,
  loading: false,
};
export const ProductStore = signalStore(
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    productService: inject(ProductService),
    errorStore: inject(ErrorStore),
  })),
  withMethods(({ authStore, productService, errorStore, ...store }) => ({
    loadProducts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          productService.loadProducts().pipe(
            tap((products) => {
              patchState(store, { products });
            }),
            catchError((err) => {
              errorStore.showError(
                'Error al cargar los productos. Por favor, inténtelo de nuevo más tarde.',
              );
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadProducts();
    },
  }),
);
