import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { EmployeesByOfficeResponse } from '../interfaces/employee.interface';
import { EmployeeService } from '../services/employee.service';
import { ToastService } from '../services/toast.service';

type EmployeeState = {
  employees: EmployeesByOfficeResponse[];
  selectedOfficeId: number;
  loading: boolean;
};

const initialState: EmployeeState = {
  employees: [],
  selectedOfficeId: 0,
  loading: false,
};

export const EmployeeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    employeeService: inject(EmployeeService),
    toastService: inject(ToastService),
  })),
  withComputed(({ employees, selectedOfficeId }) => ({
    employeesByOffice: computed(() => {
      if (selectedOfficeId() === 0) {
        return employees();
      } else {
        return employees().filter((e) => e.office?.id === selectedOfficeId() || e.office === null);
      }
    }),
  })),
  withMethods(({ employeeService, toastService, ...store }) => ({
    _loadEmployees: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(() => {
          return employeeService.getEmployeesByOffice().pipe(
            tap((employees) => {
              patchState(store, { employees: employees });
            }),
            catchError((err) => {
              toastService.show({
                title: 'Error',
                content: 'Error al cargar los empleados de la oficina.',
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
    changeSelectedOffice(officeId: number) {
      patchState(store, { selectedOfficeId: officeId });
    },
  })),

  withHooks({
    onInit(store) {
      store._loadEmployees();
    },
  }),
);
