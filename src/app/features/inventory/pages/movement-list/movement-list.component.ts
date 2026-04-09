import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { InventoryMovement } from '../../../../shared/interfaces/inventoryMovement.interface';
import { MovementInventoryStore } from '../../store/movement-inventory-store';
import { ActivatedRoute, Router } from '@angular/router';
import 'cally';
import { AuthStore } from '../../../../core/store/auth-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { EmployeeStore } from '../../../../shared/store/employee-store';

@Component({
  selector: 'app-movement-list.component',
  imports: [DatePipe],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './movement-list.component.html',
  styleUrl: './movement-list.component.css',
})
export class MovementListComponent implements OnInit {
  readonly maxRangeMonths = 3;
  readonly defaultItemsPerPage = 20;
  authStore = inject(AuthStore);
  officeStore = inject(OfficeStore);
  employeeStore = inject(EmployeeStore);
  router = inject(Router);
  route = inject(ActivatedRoute);
  movementInventoryStore = inject(MovementInventoryStore);
  service = inject(InventoryService);

  private readonly today = new Date();
  readonly todayIso = this.toIsoDate(this.today);
  startDate = signal(this.toIsoDate(this.subtractMonths(this.today, this.maxRangeMonths)));
  endDate = signal(this.toIsoDate(this.today));
  typeFilter = signal<'IN' | 'OUT' | 'TRANSFER' | undefined>(undefined);
  officeFilter = signal<number | undefined>(undefined);
  employeeFilter = signal<number | undefined>(undefined);
  itemsPerPage = signal<number>(this.defaultItemsPerPage);
  activePage = signal<number>(1);
  filterPanelSticky = signal(true);
  readonly endDateMax = computed(() => {
    const maxAllowed = this.addMonthsIso(this.startDate(), this.maxRangeMonths);
    return maxAllowed > this.todayIso ? this.todayIso : maxAllowed;
  });

  readonly groupedMovements = computed(() => {
    const todayMovements: InventoryMovement[] = [];
    const olderMovements: InventoryMovement[] = [];
    for (const movement of this.movementInventoryStore.movementList()) {
      if (this.isMovementFromToday(movement.createdAt)) {
        todayMovements.push(movement);
      } else {
        olderMovements.push(movement);
      }
    }
    return {
      todayMovements,
      olderMovements,
      hasTodayMovements: todayMovements.length > 0,
      hasOtherMovements: olderMovements.length > 0,
      hasAnyMovements: todayMovements.length + olderMovements.length > 0,
    };
  });

  constructor() {
    this.route.queryParams.subscribe((params) => {
      const startDate = params['startDate'] || this.startDate();
      const endDate = params['endDate'] || this.endDate();
      const type = (params['type'] as 'IN' | 'OUT' | 'TRANSFER') || undefined;
      const fromOfficeId = params['fromOfficeId'] ? Number(params['fromOfficeId']) : undefined;
      const toOfficeId = params['toOfficeId'] ? Number(params['toOfficeId']) : undefined;
      const employeeId = params['employeeId'] ? Number(params['employeeId']) : undefined;
      const itemsPerPage = params['limit'] ? Number(params['limit']) : this.defaultItemsPerPage;
      const page = params['page'] ? Number(params['page']) : 1;

      this.startDate.set(startDate);
      this.endDate.set(endDate);
      this.typeFilter.set(type);
      this.officeFilter.set(fromOfficeId);
      this.employeeFilter.set(employeeId);
      this.itemsPerPage.set(itemsPerPage);
      this.activePage.set(page);

      this.movementInventoryStore.getInventoyryMovements({
        startDate,
        endDate,
        fromOfficeId,
        toOfficeId,
        employeeId,
        type,
        page,
        limit: itemsPerPage,
      });
    });
  }
  ngOnInit(): void {
    this.employeeStore.loadEmployees(0);
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private subtractMonths(date: Date, months: number): Date {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() - months);
    return copy;
  }

  private addMonthsIso(isoDate: string, months: number): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setMonth(date.getMonth() + months);
    return this.toIsoDate(date);
  }

  private isMovementFromToday(createdAt: string): boolean {
    return this.toIsoDate(new Date(createdAt)) === this.todayIso;
  }

  changeTypeFilter(type: 'IN' | 'OUT' | 'TRANSFER' | undefined) {
    this.typeFilter.set(type);
  }
  changeStartDate(date: Event) {
    const startDate = (date.target as HTMLInputElement).value;
    this.startDate.set(startDate);

    const maxEndDate = this.endDateMax();
    const currentEndDate = this.endDate();
    let nextEndDate = currentEndDate;

    if (currentEndDate < startDate) {
      nextEndDate = startDate;
    }

    if (nextEndDate > maxEndDate) {
      nextEndDate = maxEndDate;
    }

    if (nextEndDate !== currentEndDate) {
      this.endDate.set(nextEndDate);
    }
  }
  changeEndDate(date: Event) {
    const endDate = (date.target as HTMLInputElement).value;
    this.endDate.set(endDate);
  }
  changeOffice(event: Event) {
    const officeValue = (event.target as HTMLSelectElement).value;
    const officeId = officeValue ? Number(officeValue) : undefined;
    this.officeFilter.set(officeId);
    this.employeeStore.loadEmployees(officeId ?? 0);
  }
  changeEmployee(event: Event) {
    const employeeId = (event.target as HTMLSelectElement).value;
    this.employeeFilter.set(employeeId ? Number(employeeId) : undefined);
  }
  changeItemsPerPage(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.itemsPerPage.set(value ? Number(value) : this.defaultItemsPerPage);
    console.log('Items per page changed to:', this.itemsPerPage());
  }

  changePage(page: number) {
    if (page < 1 || page > this.movementInventoryStore.pagination().totalPages) {
      return;
    }
    this.activePage.set(page);
    this.applyFilters();
  }

  toggleFilterPanelSticky() {
    this.filterPanelSticky.update((sticky) => !sticky);
  }

  clearFilters() {
    const defaultStartDate = this.toIsoDate(this.subtractMonths(this.today, this.maxRangeMonths));
    const defaultEndDate = this.todayIso;

    this.startDate.set(defaultStartDate);
    this.endDate.set(defaultEndDate);
    this.typeFilter.set(undefined);
    this.officeFilter.set(undefined);
    this.employeeFilter.set(undefined);
    this.itemsPerPage.set(this.defaultItemsPerPage);
    this.activePage.set(1);
    this.employeeStore.loadEmployees(0);

    this.router.navigate([], {
      queryParams: {
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        type: null,
        fromOfficeId: null,
        toOfficeId: null,
        employeeId: null,
        limit: this.defaultItemsPerPage,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  applyFilters() {
    this.router.navigate([], {
      queryParams: {
        startDate: this.startDate(),
        endDate: this.endDate(),
        type: this.typeFilter(),
        fromOfficeId: this.officeFilter(),
        toOfficeId: this.officeFilter(),
        employeeId: this.employeeFilter(),
        limit: this.itemsPerPage(),
        page: this.activePage(),
      },
      queryParamsHandling: 'merge',
    });
  }
}
