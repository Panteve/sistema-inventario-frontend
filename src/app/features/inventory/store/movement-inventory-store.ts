import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { MovementInventoryService } from '../services/inventory-movement.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import {
  CreateInventoryMovementRequest,
  InventoryMovement,
  InventoryMovementPagination,
  ParamsGetInventoryMovements,
} from '../../../shared/interfaces/inventoryMovement.interface';

import { ToastService } from '../../../shared/services/toast.service';

type MovementInventoryState = {
  loading: boolean;
  movementList: InventoryMovement[];
  pagination: InventoryMovementPagination;
};

const initialState: MovementInventoryState = {
  loading: false,
  movementList: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
  },
};

export const MovementInventoryStore = signalStore(
  withState(initialState),
  withProps(() => ({
    toastService: inject(ToastService),
    movementInventoryService: inject(MovementInventoryService),
    router: inject(Router),
  })),

  withMethods(({ toastService, movementInventoryService, router, ...store }) => ({
    getInventoyryMovements: rxMethod<ParamsGetInventoryMovements>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((params) => {
          return movementInventoryService.getInventoryMovements(params).pipe(
            tap((response) => {
              patchState(store, { movementList: response.data, pagination: response.pagination });
            }),
            catchError((error) => {
              toastService.show({
                title: 'Error',
                content: 'Error al cargar los movimientos de inventario.',
                type: 'error',
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
    createMovementInventory: rxMethod<CreateInventoryMovementRequest>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((movementData) => {
          return movementInventoryService.createMovementInventory(movementData).pipe(
            tap((response) => {
              toastService.show({
                title: 'Éxito',
                content: 'Movimiento de inventario creado exitosamente.',
                type: 'success',
              });
              router.navigate([`/inventory/history-movement/`]);
            }),
            catchError((error) => {
              console.error('Error creating inventory movement:', error);
              toastService.show({
                title: 'Error',
                content: 'Error al crear el movimiento de inventario.',
                type: 'error',
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
  })),
);
