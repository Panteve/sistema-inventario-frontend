import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { ErrorStore } from '../../../core/store/errors-store';
import { InventoryService } from '../services/inventory.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { CreateInventoryMovementRequest } from '../../../shared/interfaces/inventoryMovement.interface';
import { ProductOnInventoryResponse } from '../../../shared/interfaces/product.interface';

type MovementInventoryState = {
  loading: boolean;
  movementData: CreateInventoryMovementRequest;
};

const initialState: MovementInventoryState = {
  loading: false,
  movementData: {
    toOfficeId: 0,
    fromOfficeId: 0,
    type: 'IN',
    products: [],
  },
};

export const MovementInventoryStore = signalStore(
  withState(initialState),
  withProps(() => ({
    errorStore: inject(ErrorStore),
    inventoryService: inject(InventoryService),
    router: inject(Router),
  })),

  withMethods(({ errorStore, inventoryService, router, ...store }) => ({
    createMovementInventory: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(() => {
          const movementDataClean = {
            ...store.movementData(),
            products: store.movementData().products.map((p) => ({
              productId: p.productId,
              quantity: p.quantity,
            })),
          };
          return inventoryService.createMovementInventory(movementDataClean).pipe(
            tap((response) => {
              patchState(store, { loading: false });
              errorStore.showError('Movimiento de inventario creado exitosamente.');
              console.log(response);
              //router.navigate([`/inventory/movement/${response}`]);
            }),
            catchError((error) => {
              patchState(store, { loading: false });
              console.error(error);
              errorStore.showError('Error al crear el movimiento de inventario.');
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
          );
        }),
      ),
    ),
    addProductToMovement(product: ProductOnInventoryResponse) {
      if (!store.movementData().products.some((p) => p.productId === product.product.id)) {
        patchState(store, (state) => ({
          movementData: {
            ...state.movementData,
            products: [
              ...state.movementData.products,
              { productId: product.product.id, name: product.product.name, quantity: 1 },
            ],
          },
        }));
      } else {
        patchState(store, (state) => ({
          movementData: {
            ...state.movementData,
            products: state.movementData.products.map((p) => {
              if (p.productId === product.product.id) {
                return { ...p, quantity: p.quantity + 1 };
              }
              return p;
            }),
          },
        }));
      }
    },
    quitProduct(productId: number) {
      patchState(store, (state) => ({
        movementData: {
          ...state.movementData,
          products: state.movementData.products.filter((p) => p.productId !== productId),
        },
      }));
    },
    modifyQuantity(quantity: number, productId: number) {
      patchState(store, (state) => ({
        movementData: {
          ...state.movementData,
          products: state.movementData.products.map((p) => {
            if (p.productId === productId) {
              return { ...p, quantity };
            }
            return p;
          }),
        },
      }));
    },
    setMovementType(type: 'IN' | 'OUT' | 'TRANSFER') {
      patchState(store, (state) => ({
        movementData: {
          ...state.movementData,
          type,
        },
      }));
      this.resetMovementData();
    },
    setToOfficeId(toOfficeId: number) {
      patchState(store, (state) => ({
        movementData: {
          ...state.movementData,
          toOfficeId,
        },
      }));
    },
    setFromOfficeId(fromOfficeId: number) {
      patchState(store, (state) => ({
        movementData: {
          ...state.movementData,
          fromOfficeId,
        },
      }));
    },
    resetMovementData() {
      patchState(store, (state) => ({
        movementData: {
          ...state.movementData,
          toOfficeId: 0,
          fromOfficeId: 0,
          products: [],
        },
      }));
    },
  })),
);
