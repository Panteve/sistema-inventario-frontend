import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { CashRegisterService } from '../services/cash-register.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
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
import { Router } from '@angular/router';
import { CashRegisterSummary } from '../../../shared/interfaces/cash-register-interface';
import { AuthStore } from '../../../core/store/auth-store';
import { toObservable } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../shared/services/toast.service';

type CashRegisterState = {
  loading: boolean;
  amountReceived: number;
  openingCash: number;
  cashRegisterSummary: CashRegisterSummary;
  officeToShow: number;
};

const initialState: CashRegisterState = {
  loading: false,
  amountReceived: 0,
  openingCash: 0,
  cashRegisterSummary: {
    openedAt: '',
    closedAt: null,
    initialAmount: 0,
    finalAmount: 0,
    payments: [],
    expenses: [],
  },
  officeToShow: 0,
};

export const CashRegisterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    toastService: inject(ToastService),
    cashRegisterService: inject(CashRegisterService),
    router: inject(Router),
  })),
  withComputed(({ cashRegisterSummary, amountReceived, ...store }) => {
    const cashRegisterIsOpen = computed(() => store.authStore.employee()?.cashRegisterId);
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
    const cashDifference = computed(() => {
      if (expectedCash() < 0) {
        return amountReceived() + expectedCash();
      }
      return amountReceived() - expectedCash();
    });
    return {
      cashRegisterIsOpen,
      totalTransferSales,
      totalCashSales,
      totalExpenses,
      expectedCash,
      cashDifference,
    };
  }),
  withMethods(({ authStore, toastService, cashRegisterService, router, ...store }) => ({
    openCashRegister: rxMethod<number | null>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        filter(() => {
          if (store.amountReceived() <= 0) {
            toastService.show({
              title: 'Monto inicial no válido',
              content: 'El monto inicial no puede ser igual o menor a cero.',
              type: 'error',
            });
            patchState(store, { loading: false });
            return false;
          }
          return true;
        }),
        switchMap((officeId) => {
          if (officeId === null) {
            officeId = 0;
          }
          return cashRegisterService
            .openCashRegister({ initialAmount: store.amountReceived(), officeId: officeId })
            .pipe(
              tap((response) => {
                patchState(store, {
                  loading: false,
                  amountReceived: 0,
                  openingCash: 0,
                });
                authStore.setCashRegisterId(response.id);
                toastService.show({
                  title: 'Caja abierta exitosamente',
                  content: 'La caja ha sido abierta, feliz día.',
                  type: 'success',
                });
                router.navigate([], {
                  queryParams: { cashModal: 'null' },
                  queryParamsHandling: 'merge',
                });
              }),
              catchError((err) => {
                if (err.status === 409) {
                  toastService.show({
                    title: 'Caja ya abierta',
                    content: 'Ya existe una caja abierta para este usuario.',
                    type: 'error',
                  });
                  return EMPTY;
                }
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, { loading: false, amountReceived: 0, openingCash: 0 });
              }),
            );
        }),
      ),
    ),
    getCashRegisterSummary: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(() =>
          cashRegisterService.getCashRegisterSummary().pipe(
            tap((response) => {
              patchState(store, {
                cashRegisterSummary: response,
                officeToShow: response.office.id,
              });
              authStore.setOfficeName(response.office.name);
              authStore.setOfficeId(response.office.id);
            }),
            catchError((err) => {
              toastService.show({
                title: 'Fallo al obtener resumen de caja',
                content: 'Fallo al obtener resumen de caja, por favor intente de nuevo.',
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
                patchState(store, {
                  loading: false,
                  amountReceived: 0,
                  openingCash: 0,
                });
                authStore.setCashRegisterId(0);
                toastService.show({
                  title: 'Caja cerrada exitosamente',
                  content: 'La caja ha sido cerrada correctamente.',
                  type: 'success',
                });
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
          });
        }),
        catchError((err) => {
          toastService.show({
            title: 'Fallo al cerrar caja',
            content: 'Fallo al cerrar caja, por favor intente de nuevo.',
            type: 'error',
          });
          return EMPTY;
        }),
      ),
    ),
    changeAmountReceived(amount: number) {
      patchState(store, { amountReceived: amount });
    },
    setOfficeIdToAuth() {
      const officeId = getState(store).officeToShow;
      authStore.setOfficeId(officeId);
    },
  })),
  withHooks({
    onInit(store) {
      toObservable(computed(() => store.authStore.employee()?.cashRegisterId))
        .pipe(
          distinctUntilChanged(),
          filter((id) => !!id),
        )
        .subscribe(() => {
          store.getCashRegisterSummary();

        });
    },
  }),
);
