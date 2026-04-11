import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  ProductCatalogResponse,
  ProductOnInventoryResponse,
} from '../interfaces/product.interface';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ProductService } from '../services/product.service';
import { NgFastToastService } from 'ng-fast-toast';

type ProductState = {
  products: ProductOnInventoryResponse[];
  catalogProducts: ProductCatalogResponse[];
  modalClose: boolean;
  loading: boolean;
};

const initialState: ProductState = {
  products: [],
  catalogProducts: [],
  modalClose: false,
  loading: false,
};
export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    productService: inject(ProductService),
    toastNotification: inject(NgFastToastService)
  })),
  withMethods(({ authStore, productService, toastNotification, ...store }) => ({
    loadProductsOnInventory: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          productService.loadProductsOnInventory().pipe(
            tap((products) => {
              patchState(store, { products });
            }),
            catchError((err) => {
              toastNotification.error({
                title: 'Error al cargar productos',
                content: 'No se pudieron cargar los productos. Inténtalo de nuevo.',
                duration: 5,
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
    loadProductsCatalog: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          productService.loadProductsCatalog().pipe(
            tap((catalogProducts) => {
              patchState(store, { catalogProducts });
            }),
            catchError((err) => {
              toastNotification.error({
                title: 'Error al cargar el catálogo de productos',
                content: 'No se pudieron cargar los productos. Inténtalo de nuevo.',
                duration: 5,
              });
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    ),
    removeCatalogProducts() {
      patchState(store, { catalogProducts: [] });
    }
  })),
  withHooks({
    onInit(store) {
      store.loadProductsOnInventory();
    },
  }),
);
