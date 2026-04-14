import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../service/expense.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CreateExpenseRequest } from '../../../shared/interfaces/expense.interface';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { NgFastToastService } from 'ng-fast-toast';
import { CashRegisterStore } from '../../cash-register/store/cash-register-store';

type ExpenseState = {
  loading: boolean;
};

const initialState: ExpenseState = {
  loading: false,
};

export const ExpenseStore = signalStore(
  withState(initialState),
  withProps(() => ({
    toastNotification: inject(NgFastToastService),
    expenseService: inject(ExpenseService),
    cashRegisterStore: inject(CashRegisterStore),
    router: inject(Router),
  })),
  withMethods(({toastNotification, expenseService, router, cashRegisterStore, ...store }) => ({
    createExpense: rxMethod<CreateExpenseRequest>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((expenseData) =>
          expenseService.createExpense(expenseData).pipe(
            tap((response) => {
              toastNotification.success({
                title: 'Gasto creado exitosamente',
                content: 'El gasto ha sido registrado correctamente.',
                duration: 5,
              });
              patchState(store, { loading: false });
              cashRegisterStore.getCashRegisterSummary();
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
          toastNotification.error({
            title: 'Error al crear gasto',
            content: 'Fallo al crear gasto, por favor intente de nuevo.',
            duration: 5,
          });
          patchState(store, { loading: false });
          return EMPTY;
        }),
      ),
    ),
  })),
);
