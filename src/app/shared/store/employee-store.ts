import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth-store';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { EmployeesByOfficeResponse } from '../interfaces/employee.interface';
import { EmployeeService } from '../services/employee.service';
import { ToastService } from '../services/toast.service';

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
    toastService: inject(ToastService),
  })),
  withMethods(({ authStore, employeeService, toastService, ...store }) => ({
    loadEmployees: rxMethod<number>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((officeId) => {
          return employeeService.getEmployeesByOffice(officeId).pipe(
            tap((employees) => {
              patchState(store, { employees });
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
    
  })),
);
