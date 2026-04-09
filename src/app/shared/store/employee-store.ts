import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { ErrorStore } from '../../core/store/errors-store';
import { EmployeesByOfficeResponse } from '../interfaces/employee.interface';
import { EmployeeService } from '../services/employee.service';

type EmployeeState = {
  employees: EmployeesByOfficeResponse[];
  loading: boolean;
};

const initialState: EmployeeState = {
  employees: [],
  loading: false,
};
export const EmployeeStore = signalStore(
  withState(initialState),
  withProps(() => ({
    authStore: inject(AuthStore),
    employeeService: inject(EmployeeService),
    errorStore: inject(ErrorStore),
  })),
  withMethods(({ authStore, employeeService, errorStore, ...store }) => ({
    loadEmployees: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((officeId) =>
          employeeService.getEmployeesByOffice(officeId).pipe(
            tap((employees) => {
              patchState(store, { employees });
            }),
            catchError((err) => {
              errorStore.showError(
                'Error al cargar los empleados. Por favor, inténtelo de nuevo más tarde.',
              );
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
