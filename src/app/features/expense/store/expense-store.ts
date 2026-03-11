import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { ErrorStore } from '../../../core/store/errors-store';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../service/expense.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CreateExpenseRequest } from '../../../shared/interfaces/expense.interface';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';

type ExpenseState = {
  loading: boolean;
};

const initialState: ExpenseState = {
  loading: false,
};

export const ExpenseStore = signalStore(
  withState(initialState),
  withProps(() => ({
    errorStore: inject(ErrorStore),
    expenseService: inject(ExpenseService),
    router: inject(Router),
  })),
  withMethods(({ errorStore, expenseService, router, ...store }) => ({
    createExpense: rxMethod<CreateExpenseRequest>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((expenseData) =>
          expenseService.createExpense(expenseData).pipe(
            tap((response) => {
              errorStore.showError('Gasto creado exitosamente.');
              patchState(store, { loading: false });
              router.navigate([], {
                queryParams: { expenseModal: 'null' },
                queryParamsHandling: 'merge',
              });
            }),
          ),
        ),
        finalize(() => {
          patchState(store, { loading: false });
        }),
        catchError((err) => {
          console.error('Error al crear gasto:', err);
          errorStore.showError('Fallo al crear gasto, por favor intente de nuevo.');
          patchState(store, { loading: false });
          return EMPTY;
        }),
      ),
    ),
  })),
);
