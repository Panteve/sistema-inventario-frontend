import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { InventoryService } from '../services/inventory.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import {
  CreateInventoryMovementRequest,
  InventoryMovement,
  InventoryMovementPagination,
  ParamsGetInventoryMovements,
} from '../../../shared/interfaces/inventoryMovement.interface';
import {
  ProductCatalogResponse,
  ProductOnInventoryResponse,
} from '../../../shared/interfaces/product.interface';
import { NgFastToastService } from 'ng-fast-toast';

type MovementInventoryState = {
  loading: boolean;
  movementData: CreateInventoryMovementRequest;
  movementList: InventoryMovement[];
  pagination: InventoryMovementPagination;
};

const initialState: MovementInventoryState = {
  loading: false,
  movementData: {
    toOfficeId: 0,
    fromOfficeId: 0,
    type: 'IN',
    products: [],
  },
  movementList: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
  },
};

export const MovementInventoryStore = signalStore(
  withState(initialState),
  withProps(() => ({
    toastNotification: inject(NgFastToastService),
    inventoryService: inject(InventoryService),
    router: inject(Router),
  })),

  withMethods(({ toastNotification, inventoryService, router, ...store }) => ({
    getInventoyryMovements: rxMethod<ParamsGetInventoryMovements>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((params) => {
          const httpParams: ParamsGetInventoryMovements = {
            startDate: params.startDate,
            endDate: params.endDate,
          };
          if (params.fromOfficeId) httpParams.fromOfficeId = params.fromOfficeId;
          if (params.toOfficeId) httpParams.toOfficeId = params.toOfficeId;
          if (params.employeeId) httpParams.employeeId = params.employeeId;
          if (params.type) httpParams.type = params.type;
          if (params.limit) httpParams.limit = params.limit;
          if (params.page) httpParams.page = params.page;
          return inventoryService.getInventoryMovements(httpParams).pipe(
            tap((response) => {
              patchState(store, { movementList: response.data, pagination: response.pagination });
            }),
            catchError((error) => {
              queueMicrotask(() => {
                toastNotification.error({
                  title: 'Error',
                  content: 'Error al cargar los movimientos de inventario.',
                  duration: 5,
                });
              });
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
          );
        }),
      ),
    ),

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
              queueMicrotask(() => {
                toastNotification.success({
                  title: 'Éxito',
                  content: 'Movimiento de inventario creado exitosamente.',
                  duration: 5,
                });
              });
              console.log(response);
              //router.navigate([`/inventory/movement/${response}`]);
            }),
            catchError((error) => {
              patchState(store, { loading: false });
              queueMicrotask(() => {
                toastNotification.error({
                  title: 'Error',
                  content: 'Error al crear el movimiento de inventario.',
                  duration: 5,
                });
              });
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
          );
        }),
      ),
    ),
    addProductInventoryToMovement(product: ProductOnInventoryResponse) {
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
    addProductCatalogToMovement(product: ProductCatalogResponse) {
      if (!store.movementData().products.some((p) => p.productId === product.id)) {
        patchState(store, (state) => ({
          movementData: {
            ...state.movementData,
            products: [
              ...state.movementData.products,
              { productId: product.id, name: product.name, quantity: 1 },
            ],
          },
        }));
      } else {
        patchState(store, (state) => ({
          movementData: {
            ...state.movementData,
            products: state.movementData.products.map((p) => {
              if (p.productId === product.id) {
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
    resetProductsInMovement() {
      patchState(store, (state) => ({
        movementData: {
          ...state.movementData,
          products: [],
        },
      }));
    },
  })),
);
