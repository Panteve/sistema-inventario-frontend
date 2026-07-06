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
import { ProductOnInventoryResponse } from '../interfaces/product.interface';
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
import { toObservable } from '@angular/core/rxjs-interop';
import { ToastService } from '../services/toast.service';
import { InventoryService } from '../services/inventory.service';
import { entityConfig, setAllEntities, updateEntity, upsertEntity, withEntities } from '@ngrx/signals/entities';

type InventoryState = {
  showingInactive: boolean;
  loading: boolean;
};

const initialState: InventoryState = {
  showingInactive: false,
  loading: false,
};

const ProductOnInventoryResponseConfig = entityConfig({
  entity: type<ProductOnInventoryResponse>(),
  collection: '_products',
  selectId: (product) => product.product.id,
});

export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    inventoryService: inject(InventoryService),
    toastService: inject(ToastService),
  })),
  withEntities(ProductOnInventoryResponseConfig),
  withComputed(({ _productsEntities, showingInactive }) => ({
    products: computed(() => {
      if (showingInactive()) {
        return _productsEntities().filter((product) => !product.status);
      } else {
        return _productsEntities().filter((product) => product.status);
      }
    }),
  })),
  withMethods(({ authStore, inventoryService, toastService, ...store }) => ({
    loadProductsOnInventory: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          inventoryService.loadInventory(authStore.employee()?.officeId).pipe(
            tap((products) => {
              patchState(store, setAllEntities(products, ProductOnInventoryResponseConfig));
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
    modifyProductStock(products: { productId: number; priceUnique?: number; quantity: number }[]) {
      products.forEach((productFromBill) => {
        patchState(
          store,
          updateEntity(
            {
              id: productFromBill.productId,
              changes: (product) => ({ quantity: product.quantity - productFromBill.quantity }),
            },
            ProductOnInventoryResponseConfig,
          ),
        );
      });
    },
    modifyProductStatus(productId: number) {
      patchState(
        store,
        updateEntity(
          {
            id: productId,
            changes: (product) => ({ status: !product.status }),
          },
          ProductOnInventoryResponseConfig,
        ),
      );
    },
    setShowingInactive(showingInactive: boolean) {
      patchState(store, { showingInactive });
    },
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
