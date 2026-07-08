import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { EmployeeService } from '../../../../shared/services/employee.service';
import {
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/angular-table';
import { ToastService } from '../../../../shared/services/toast.service';
import { EmployeeAction, EmployeeResponse } from '../../../../shared/interfaces/employee.interface';
import { finalize } from 'rxjs';
import { EmployeeCreateComponent } from '../../components/employee-create/employee-create.component';
import { EmployeeEditInfoComponent } from '../../components/employee-edit-info/employee-edit-info.component';
import { EmployeeChangePasswordComponent } from '../../components/employee-change-password/employee-change-password.component';
import { EmployeeStatusToggleComponent } from '../../components/employee-status-toggle/employee-status-toggle.component';
import { ModalComponent } from '../../../../shared/components/modal.component/modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-employees.component',
  imports: [
    FlexRenderDirective,
    EmployeeCreateComponent,
    EmployeeEditInfoComponent,
    EmployeeChangePasswordComponent,
    EmployeeStatusToggleComponent,
    ModalComponent,
  ],
  templateUrl: './employees.component.html',
})
export class EmployeesComponent implements OnInit {
  employeeService = inject(EmployeeService);
  toastService = inject(ToastService);

  globalFilter = signal<string>('');
  loadingEmployees = signal<boolean>(false);
  loadingModal = signal<boolean>(false);

  employees = signal<EmployeeResponse[]>([]);
  selectedEmployee = signal<EmployeeResponse | null>(null);
  employeeModalOpen = signal<boolean>(false);
  currentAction = signal<EmployeeAction | null>(null);
  showingInactive = signal(false);
  displayedEmployees = computed(() => {
    return this.showingInactive()
      ? this.employees().filter((e) => !e.status)
      : this.employees().filter((e) => e.status);
  });

  activeEmployees = computed(() => this.employees().filter((employee) => employee.status).length);
  inactiveEmployees = computed(() => this.employees().length - this.activeEmployees());

  changeShowInactive(value: boolean) {
    this.showingInactive.set(value);
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  addEmployee(employee: EmployeeResponse) {
    this.employees.update((employees) => [...employees, employee]);
  }
  loadEmployees() {
    this.loadingEmployees.set(true);
    this.globalFilter.set('');
    this.table.firstPage();
    this.employeeService
      .getAllEmployees()
      .pipe(finalize(() => this.loadingEmployees.set(false)))
      .subscribe({
        next: (response) => {
          this.employees.set(response);
        },
        error: () => {
          this.toastService.show({
            title: 'Error',
            content: 'Error al cargar los empleados',
            type: 'error',
          });
        },
      });
  }

  table = createAngularTable(() => ({
    data: this.displayedEmployees(),
    columns: [
      {
        header: 'Nombre',
        accessorKey: 'name',
        id: 'name',
      },
      {
        header: 'Documento',
        accessorKey: 'document',
        id: 'document',
      },
      {
        header: 'Correo',
        accessorKey: 'email',
        id: 'email',
      },
      {
        header: 'Oficina',
        accessorKey: 'office.name',
        id: 'officeName',
      },
      {
        header: 'Rol',
        accessorKey: 'role',
        id: 'role',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        id: 'status',
      },
    ],
    state: {
      globalFilter: this.globalFilter(),
    },
    onGlobalFilterChange: (value) => {
      this.globalFilter.set(value as string);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const filter = String(filterValue).trim().toLowerCase();
      if (!filter) {
        return true;
      }

      const employee = row.original;
      const searchableValues = [
        employee.id,
        employee.name,
        employee.document,
        employee.email,
        employee.office?.name ? employee.office.name : 'sin oficina',
        this.getRoleLabel(employee.role),
      ];
      const statusLabel = employee.status ? 'activo' : 'inactivo';

      return (
        statusLabel.startsWith(filter) ||
        searchableValues.some((value) => String(value).toLowerCase().includes(filter))
      );
    },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 7,
      },
    },
  }));

  searchProducts(search: string) {
    this.globalFilter.set(search);
    this.table.firstPage();
  }
  nextPage() {
    this.table.nextPage();
  }

  previousPage() {
    this.table.previousPage();
  }

  onRowClick(employee: EmployeeResponse) {
    const currentEmployee = this.selectedEmployee();
    this.selectedEmployee.set(currentEmployee?.id === employee.id ? null : employee);
  }

  openEditInfoModal() {
    this.employeeModalOpen.set(true);
    this.currentAction.set(EmployeeAction.EDIT_INFO);
  }

  openCreateEmployeeModal() {
    this.employeeModalOpen.set(true);
    this.currentAction.set(EmployeeAction.CREATE);
  }
  openChangePasswordModal() {
    this.employeeModalOpen.set(true);
    this.currentAction.set(EmployeeAction.CHANGE_PASSWORD);
  }

  openDeactivateModal() {
    this.employeeModalOpen.set(true);
    this.currentAction.set(EmployeeAction.STATUS_TOGGLE);
  }

  onEmployeeChanged(updated: EmployeeResponse) {
    this.employees.update((employees) =>
      employees.map((employee) => (employee.id === updated.id ? updated : employee)),
    );
    const selected = this.selectedEmployee();

    if (selected?.id === updated.id) {
      this.selectedEmployee.set(updated);
    }
  }

  clearSelectedEmployee(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    if (target.closest('button, input, select, textarea, label, a, tr, dialog, [data-exception]')) {
      return;
    }

    this.selectedEmployee.set(null);
  }

  setLoadingModal(event: boolean) {
    this.loadingModal.set(event);
  }

  closeEmployeeModal() {
    this.employeeModalOpen.set(false);
    this.currentAction.set(null);
  }

  getRoleLabel(role: EmployeeResponse['role']) {
    return role === 'ADMIN' ? 'Administrador' : 'Cajero';
  }
}
