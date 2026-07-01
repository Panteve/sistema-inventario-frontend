import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  InventoryMovement,
  InventoryMovementPagination,
  ParamsGetInventoryMovements,
} from '../../../../shared/interfaces/inventoryMovement.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../../../../core/store/auth-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ViewMovementComponent } from '../../layouts/view-movement/view-movement.component';
import { FiltersComponent } from '../../../../shared/components/filters.component/filters.component';
import {
  isIsoDate,
  maxRangeMonths,
  normalizeDateRange,
  parseNumber,
  subtractMonths,
  toIsoDate,
} from '../../../../shared/utils/filter-query.utils';
import { ModalComponent } from '../../../../shared/components/modal.component/modal.component';
import { MovementInventoryService } from '../../services/inventory-movement.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-movement-list.component',
  imports: [DatePipe, ViewMovementComponent, FiltersComponent, ModalComponent],
  providers: [DatePipe],
  templateUrl: './movement-list.component.html',
})
export class MovementListComponent implements OnInit {
  readonly defaultItemsPerPage = 20;

  authStore = inject(AuthStore);
  movementInventoryService = inject(MovementInventoryService);
  toastService = inject(ToastService);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  readonly #today = new Date();
  readonly todayIso = toIsoDate(this.#today);
  queryParams = signal<ParamsGetInventoryMovements>(this.#buildDefaultParams());

  movementList = signal<InventoryMovement[]>([]);
  loading = signal(false);
  pagination = signal<InventoryMovementPagination>({ totalItems: 0, totalPages: 0 });
  movementSelected = signal<InventoryMovement | null>(null);
  filterPanelSticky = signal(false);

  viewModalOpen = toSignal(
    this.#route.queryParamMap.pipe(map((params) => params.get('viewModal') === 'open')),
    { initialValue: false },
  );
  readonly groupedMovements = computed(() => {
    const todayMovements: InventoryMovement[] = [];
    const olderMovements: InventoryMovement[] = [];
    for (const movement of this.movementList()) {
      if (this.#isMovementFromToday(movement.createdAt)) {
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
    const navInventoryMovement = this.#router.currentNavigation()?.extras.state?.['inventoryMovement'] as
      | InventoryMovement
      | undefined;
    if (navInventoryMovement) {
      this.movementSelected.set(navInventoryMovement);
      this.openViewModal();
      this.loading.set(false);
    }
    effect(() => {
      if (!this.loading() && this.#route.snapshot.queryParamMap.get('fromDashboard')) {
        this.movementSelected.set(
          this.movementList().find(
            (m) => m.id === Number(this.#route.snapshot.queryParamMap.get('fromDashboard')),
          )!,
        );
        this.openViewModal();
      }
    });
  }

  ngOnInit(): void {
    // Priority: URL (deep links) > defaults.
    const defaults = this.#buildDefaultParams();
    const params = this.#route.snapshot.queryParamMap;
    const hasNonDateParams = [
      'type',
      'fromOfficeId',
      'toOfficeId',
      'employeeId',
      'page',
      'limit',
    ].some((key) => params.has(key));
    const startDate = isIsoDate(params.get('startDate'))
      ? params.get('startDate')!
      : defaults.startDate;
    const endDate = isIsoDate(params.get('endDate')) ? params.get('endDate')! : defaults.endDate;
    const type = hasNonDateParams ? this.#parseMovementType(params.get('type')) : defaults.type;
    const fromOfficeIdFromQuery = parseNumber(params.get('fromOfficeId'));
    const toOfficeIdFromQuery = parseNumber(params.get('toOfficeId'));
    const employeeId = hasNonDateParams
      ? parseNumber(params.get('employeeId'))
      : defaults.employeeId;
    const limitFromQuery = parseNumber(params.get('limit'));
    const pageFromQuery = parseNumber(params.get('page'));
    const limit = limitFromQuery && limitFromQuery > 0 ? limitFromQuery : defaults.limit;
    const page = pageFromQuery && pageFromQuery > 0 ? pageFromQuery : defaults.page;

    const officeIdFromParams = fromOfficeIdFromQuery ?? toOfficeIdFromQuery;
    const officeId = hasNonDateParams
      ? officeIdFromParams
      : (officeIdFromParams ?? defaults.fromOfficeId);
    const resolvedOfficeId = this.authStore.isAdmin() ? officeId : defaults.fromOfficeId;
    const nextParams: ParamsGetInventoryMovements = {
      ...defaults,
      startDate,
      endDate,
      type,
      fromOfficeId: resolvedOfficeId,
      toOfficeId: resolvedOfficeId,
      employeeId,
      limit,
      page,
    };
    this.queryParams.set(normalizeDateRange(nextParams, this.todayIso, this.authStore.isAdmin()));
    this.applyFilters();
  }

  #buildDefaultParams(): ParamsGetInventoryMovements {
    const startDate = toIsoDate(subtractMonths(this.#today, maxRangeMonths));
    const endDate = toIsoDate(this.#today);
    const officeId = this.authStore.isAdmin() ? undefined : this.authStore.employee()?.officeId;

    return {
      startDate,
      endDate,
      type: undefined,
      fromOfficeId: officeId,
      toOfficeId: officeId,
      employeeId: undefined,
      limit: this.defaultItemsPerPage,
      page: 1,
    };
  }

  #parseMovementType(value: string | null): 'IN' | 'OUT' | 'TRANSFER' | undefined {
    if (value === 'IN' || value === 'OUT' || value === 'TRANSFER') {
      return value;
    }
    return undefined;
  }

  #isMovementFromToday(createdAt: string): boolean {
    return toIsoDate(new Date(createdAt)) === this.todayIso;
  }

  changeTypeFilter(type: 'IN' | 'OUT' | 'TRANSFER' | undefined) {
    this.queryParams.update((params) => ({
      ...params,
      type,
      page: 1,
    }));
  }

  changePage(value: number) {
    const page = this.queryParams().page + value;
    if (page < 1 || page > this.pagination().totalPages) {
      return;
    }
    this.queryParams.update((params) => ({
      ...params,
      page,
    }));
    this.applyFilters();
  }

  toggleFilterPanelSticky() {
    this.filterPanelSticky.update((sticky) => !sticky);
  }

  clearFilters() {
    this.queryParams.set(this.#buildDefaultParams());
    this.applyFilters();
  }

  applyFilters() {
    this.loading.set(true);
    this.movementInventoryService.getInventoryMovements(this.queryParams()).subscribe({
      next: (response) => {
        this.movementList.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.show({
          title: 'Error',
          content: 'Error al cargar los movimientos de inventario.',
          type: 'error',
        });
      },
    });
  }

  setMovementSelected(movement: InventoryMovement) {
    this.movementSelected.set(movement);
  }

  openViewModal() {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { viewModal: 'open', fromDashboard: null },
      queryParamsHandling: 'merge',
    });
  }

  closeViewModal() {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { viewModal: null },
      queryParamsHandling: 'merge',
    });
    this.movementSelected.set(null);
  }
}
