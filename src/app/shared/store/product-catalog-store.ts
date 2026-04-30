import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { ProductCatalogResponse } from '../interfaces/product.interface';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ProductService } from '../services/product.service';

import { ToastService } from '../services/toast.service';

type ProductState = {
  catalogProducts: ProductCatalogResponse[];
  loading: boolean;
};

const initialState: ProductState = {
  catalogProducts: [],
  loading: false,
};
export const ProductCatalogStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    productService: inject(ProductService),
    toastService: inject(ToastService),
  })),
  withMethods(({ authStore, productService, toastService, ...store }) => ({
    loadProductsCatalog: rxMethod<boolean>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((showDelete) =>
          productService.loadProductsCatalog(showDelete).pipe(
            tap((catalogProducts) => {
              patchState(store, { catalogProducts });
            }),
            catchError((err) => {
              toastService.show({
                title: 'Error al cargar el catálogo de productos',
                content: 'No se pudieron cargar los productos. Inténtalo de nuevo.',
                type: 'error',
              });

              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
    changeProductOnCatalog(product: ProductCatalogResponse) {
      patchState(store, {
        catalogProducts: store.catalogProducts().map((p) => (p.id === product.id ? product : p)),
      });
    },
  })),
);
