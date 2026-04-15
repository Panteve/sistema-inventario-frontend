import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../service/expense.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CreateExpenseRequest } from '../../../shared/interfaces/expense.interface';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';

import { CashRegisterStore } from '../../cash-register/store/cash-register-store';
import { ToastService } from '../../../shared/services/toast.service';

type ExpenseState = {
  loading: boolean;
};

const initialState: ExpenseState = {
  loading: false,
};

export const ExpenseStore = signalStore(
  withState(initialState),
  withProps(() => ({
    toastService: inject(ToastService),
    expenseService: inject(ExpenseService),
    cashRegisterStore: inject(CashRegisterStore),
    router: inject(Router),
  })),
  withMethods(({ toastService, expenseService, router, cashRegisterStore, ...store }) => ({
    createExpense: rxMethod<CreateExpenseRequest>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((expenseData) =>
          expenseService.createExpense(expenseData).pipe(
            tap((response) => {
              toastService.show({
                title: 'Gasto creado exitosamente',
                content: 'El gasto ha sido registrado correctamente.',
                type: 'success',
              });
              cashRegisterStore.getCashRegisterSummary();
              router.navigate([], {
                queryParams: { expenseModal: 'null' },
                queryParamsHandling: 'merge',
              });
            }),
            catchError((err) => {
              toastService.show({
                title: 'Error al crear gasto',
                content: 'Fallo al crear gasto, por favor intente de nuevo.',
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
  })),
);
