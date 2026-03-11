import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { ErrorStore } from '../../../core/store/errors-store';
import { computed, inject } from '@angular/core';
import { CashRegisterService } from '../services/cash-register.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, filter, finalize, pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { CashRegisterSummaryResponse } from '../../../shared/interfaces/cash-register-interface';

type CashRegisterState = {
  loading: boolean;
  amountReceived: number;
  cashRegisterId: number;
  openingCash: number;
  cashRegisterSummary: CashRegisterSummaryResponse;
};

const initialState: CashRegisterState = {
  loading: false,
  amountReceived: 0,
  cashRegisterId: 0,
  openingCash: 0,
  cashRegisterSummary: {
    openedAt: '',
    closedAt: null,
    initialAmount: 0,
    finalAmount: 0,
    payments: [],
    expenses: [],
  },
};

export const CashRegisterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ cashRegisterSummary, amountReceived, cashRegisterId }) => {
    const cashRegisterOpen = computed(() => cashRegisterId() !== 0);
    const totalTransferSales = computed(() =>
      cashRegisterSummary().payments.reduce((sum, payment) => {
        if (!payment.paymentMethod.affectsCash) {
          return sum + payment.amount;
        }
        return sum;
      }, 0),
    );
    const totalCashSales = computed(() =>
      cashRegisterSummary().payments.reduce((sum, payment) => {
        if (payment.paymentMethod.affectsCash) {
          return sum + payment.amount;
        }
        return sum;
      }, 0),
    );
    const totalExpenses = computed(() =>
      cashRegisterSummary().expenses.reduce((sum, expense) => sum + expense.amount, 0),
    );
    const expectedCash = computed(
      () => cashRegisterSummary().initialAmount + totalCashSales() - totalExpenses(),
    );
    const cashDifference = computed(() => amountReceived() - expectedCash());
    return {
      cashRegisterOpen,
      totalTransferSales,
      totalCashSales,
      totalExpenses,
      expectedCash,
      cashDifference,
    };
  }),
  withProps(() => ({
    errorStore: inject(ErrorStore),
    cashRegisterService: inject(CashRegisterService),
    router: inject(Router),
  })),
  withMethods(({ errorStore, cashRegisterService, router, ...store }) => ({
    openCashRegister: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        filter(() => {
          if (store.amountReceived() <= 0) {
            errorStore.showError('El monto inicial no puede ser igual o menor a cero.');
            patchState(store, { loading: false });
            return false;
          }
          return true;
        }),
        switchMap(() =>
          cashRegisterService.openCashRegister({ initialAmount: store.amountReceived() }).pipe(
            tap((response) => {
              patchState(store, { loading: false, cashRegisterId: response.id });
              errorStore.showError('Caja abierta exitosamente');
              router.navigate([], {
                queryParams: { cashModal: 'null' },
                queryParamsHandling: 'merge',
              });
            }),
          ),
        ),
        finalize(() => {
          patchState(store, { loading: false, amountReceived: 0, openingCash: 0 });
        }),
        catchError((err) => {
          if (err.status === 409) {
            errorStore.showError('Ya existe una caja abierta para este usuario');
            return EMPTY;
          }
          errorStore.showError('Fallo al abrir caja, por favor intente de nuevo.');
          return EMPTY;
        }),
      ),
    ),
    getCashRegisterSummary: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(() =>
          cashRegisterService.getCashRegisterSummary(store.cashRegisterId()).pipe(
            tap((response) => {
              patchState(store, { loading: false, cashRegisterSummary: response });
            }),
          ),
        ),
        finalize(() => {
          patchState(store, { loading: false });
        }),
        catchError((err) => {
          errorStore.showError('Fallo al obtener resumen de caja, por favor intente de nuevo.');
          return EMPTY;
        }),
      ),
    ),
    closeCashRegister: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(() =>
          cashRegisterService
            .closeCashRegister({
              amountRecived: store.amountReceived(),
              difference: store.cashDifference(),
            })
            .pipe(
              tap((response) => {
                patchState(store, { loading: false, cashRegisterId: 0 });
                errorStore.showError('Caja cerrada exitosamente');
                router.navigate([], {
                  queryParams: { cashModal: 'null' },
                  queryParamsHandling: 'merge',
                });
              }),
            ),
        ),
        finalize(() => {
          patchState(store, {
            loading: false,
            cashRegisterId: 0,
            amountReceived: 0,
            openingCash: 0,
          });
        }),
        catchError((err) => {
          console.error('Error al cerrar caja:', err);
          errorStore.showError('Fallo al cerrar caja, por favor intente de nuevo.');
          return EMPTY;
        }),
      ),
    ),
    changeAmountReceived(amount: number) {
      patchState(store, { amountReceived: amount });
    },
    setCashRegisterId(id: number) {
      if (id === 0) {
        patchState(store, {
          cashRegisterId: 0,
          cashRegisterSummary: initialState.cashRegisterSummary,
        });
        return;
      }
      patchState(store, { cashRegisterId: id });
    },
  })),
);
