import {
  patchState,
  signalStore,
  type,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { ProductCatalogResponse } from '../interfaces/product.interface';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ProductService } from '../services/product.service';
import { ToastService } from '../services/toast.service';
import {
  entityConfig,
  setAllEntities,
  withEntities,
  updateEntity,
  prependEntity,
} from '@ngrx/signals/entities';

type ProductState = {
  showingInactive: boolean;
  loading: boolean;
};

const initialState: ProductState = {
  showingInactive: false,
  loading: false,
};

const ProductOnInventoryResponseConfig = entityConfig({
  entity: type<ProductCatalogResponse>(),
  collection: '_catalogProducts',
  selectId: (product) => product.id,
});

export const ProductCatalogStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    productService: inject(ProductService),
    toastService: inject(ToastService),
  })),
  withEntities(ProductOnInventoryResponseConfig),
  withComputed(({ _catalogProductsEntities, showingInactive }) => ({
    catalogProducts: computed(() => {
      if (showingInactive()) {
        return _catalogProductsEntities().filter((product) => !product.status);
      } else {
        return _catalogProductsEntities().filter((product) => product.status);
      }
    }),
  })),
  withMethods(({ authStore, productService, toastService, ...store }) => ({
    loadProductsCatalog: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((params) =>
          productService.loadProductsCatalog().pipe(
            tap((catalogProducts) => {
              patchState(store, setAllEntities(catalogProducts, ProductOnInventoryResponseConfig));
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
    changeProductOnCatalog(productCatalog: ProductCatalogResponse) {
      patchState(
        store,
        updateEntity(
          {
            id: productCatalog.id,
            changes: { ...productCatalog },
          },
          ProductOnInventoryResponseConfig,
        ),
      );
    },
    addProductOnCatalog(productCatalog: ProductCatalogResponse) {
      patchState(store, prependEntity(productCatalog, ProductOnInventoryResponseConfig));
    },
    setShowingInactive(showingInactive: boolean) {
      patchState(store, { showingInactive });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadProductsCatalog();
    },
  }),
);
