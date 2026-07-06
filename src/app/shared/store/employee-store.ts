import {
  patchState,
  signalStore,
  type,
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
import { addEntity, entityConfig, setAllEntities, withEntities } from '@ngrx/signals/entities';

type EmployeeState = {
  selectedOfficeId: number;
  loading: boolean;
};

const initialState: EmployeeState = {
  selectedOfficeId: 0,
  loading: false,
};

const EmployeesByOfficeResponseConfig = entityConfig({
  entity: type<EmployeesByOfficeResponse>(),
  collection: 'employees',
  selectId: (employee) => employee.id,
});

export const EmployeeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    employeeService: inject(EmployeeService),
    toastService: inject(ToastService),
  })),
  withEntities(EmployeesByOfficeResponseConfig),
  withComputed(({ employeesEntities, selectedOfficeId }) => ({
    employeesByOffice: computed(() => {
      if (selectedOfficeId() === 0) {
        return employeesEntities();
      } else {
        return employeesEntities().filter((e) => e.office?.id === selectedOfficeId() || e.office === null);
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
              patchState(store, setAllEntities(employees, EmployeesByOfficeResponseConfig));
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
    addEmployee(employee: EmployeesByOfficeResponse) {
      patchState(store, addEntity(employee, EmployeesByOfficeResponseConfig));
    }
  })),

  withHooks({
    onInit(store) {
      store._loadEmployees();
    },
  }),
);
