import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { TableProducts } from '../../../../shared/layouts/table-products/table-products';
import { InventoryStore } from '../../../../shared/store/inventory-store';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../core/store/auth-store';
import { CurrencyPipe } from '@angular/common';
import { OfficeStore } from '../../../../shared/store/office-store';

type PriceFilterType = 'unitPrice' | 'wholesalePrice' | 'none';
type PriceOrderType = 'none' | 'asc' | 'desc';
type StockStatusFilter = 'normal' | 'low' | 'out';

@Component({
  selector: 'app-inventory-list',
  imports: [TableProducts],
  providers: [CurrencyPipe],
  templateUrl: './inventory-list.component.html',
})
export class InventoryListComponent implements OnDestroy {
  readonly #stockFilterDebounceMs = 350;
  readonly #priceFilterDebounceMs = 350;

  authStore = inject(AuthStore);
  inventoryStore = inject(InventoryStore);
  officeStore = inject(OfficeStore);
  router = inject(Router);
  #currencyPipe = inject(CurrencyPipe);

  visibleProductsCount = signal(0);
  selectedOrderGeneral = signal('none');
  draftMinStockFilter = signal<number | null>(null);
  draftMaxStockFilter = signal<number | null>(null);
  minStockFilter = signal<number | null>(null);
  maxStockFilter = signal<number | null>(null);
  selectedPriceFilterType = signal<PriceFilterType>('none');
  selectedPriceOrder = signal<PriceOrderType>('none');
  draftMinPriceFilter = signal<number | null>(null);
  draftMaxPriceFilter = signal<number | null>(null);
  minPriceFilter = signal<number | null>(null);
  maxPriceFilter = signal<number | null>(null);
  selectedStockStatuses = signal<StockStatusFilter[]>([]);

  enableStatusStockHighlight = signal<boolean>(true);
  quantityProducts = signal<number>(15);
  lowStockThreshold = signal<number>(5);

  minPriceFocus = signal<boolean>(false);
  maxPriceFocus = signal<boolean>(false);

  displayMinPrice = computed(() => {
    if (this.minPriceFocus()) {
      const val = this.draftMinPriceFilter();
      return val === null ? '' : String(val);
    }
    return this.#currencyPipe.transform(this.draftMinPriceFilter(), 'COP', '', '1.2-2') ?? '0,00';
  });

  displayMaxPrice = computed(() => {
    if (this.maxPriceFocus()) {
      const val = this.draftMaxPriceFilter();
      return val === null ? '' : String(val);
    }
    return this.#currencyPipe.transform(this.draftMaxPriceFilter(), 'COP', '', '1.2-2') ?? '0,00';
  });

  constructor() {
    this.#setupDebouncedRangeSync(
      this.draftMinStockFilter,
      this.draftMaxStockFilter,
      this.minStockFilter,
      this.maxStockFilter,
      this.#stockFilterDebounceMs,
    );

    this.#setupDebouncedRangeSync(
      this.draftMinPriceFilter,
      this.draftMaxPriceFilter,
      this.minPriceFilter,
      this.maxPriceFilter,
      this.#priceFilterDebounceMs,
    );
  }
  ngOnDestroy(): void {
    if (this.authStore.isAdmin()) {
      this.authStore.resetOfficeIdFromCashRegister();
    }
  }
  #setupDebouncedRangeSync(
    draftMinSignal: { (): number | null },
    draftMaxSignal: { (): number | null },
    targetMinSignal: { set: (value: number | null) => void },
    targetMaxSignal: { set: (value: number | null) => void },
    debounceMs: number,
  ) {
    effect((onCleanup) => {
      const draftMin = draftMinSignal();
      const draftMax = draftMaxSignal();

      const timeoutId = window.setTimeout(() => {
        targetMinSignal.set(draftMin);
        targetMaxSignal.set(draftMax);
      }, debounceMs);

      onCleanup(() => window.clearTimeout(timeoutId));
    });
  }

  changeQuantityProducts(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = this.#parseNullableNumber(value);
    if (parsedValue === null || parsedValue < 0 || parsedValue > 50) {
      return;
    }
    this.quantityProducts.set(parsedValue || 15);
  }

  changeLowStockThreshold(event: Event) {
    if (this.enableStatusStockHighlight()) {
      const value = (event.target as HTMLInputElement).value;
      this.lowStockThreshold.set(this.#parseNullableNumber(value) || 5);
    }
  }

  changeOrderGeneral(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedOrderGeneral.set(selectElement.value);
  }

  changeStockFilterMin(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.draftMinStockFilter.set(this.#parseNullableNumber(value));
  }

  changeStockFilterMax(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.draftMaxStockFilter.set(this.#parseNullableNumber(value));
  }

  changePriceFilterType(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nextType = selectElement.value as PriceFilterType;

    this.selectedPriceFilterType.set(nextType);

    if (nextType === 'none') {
      this.#resetPriceFilters();
    }
  }

  changePriceOrder(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedPriceOrder.set(selectElement.value as PriceOrderType);
  }

  changePriceFilterMin(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.draftMinPriceFilter.set(this.#parseNullableNumber(value));
  }

  changePriceFilterMax(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.draftMaxPriceFilter.set(this.#parseNullableNumber(value));
  }

  toggleStockStatus(status: StockStatusFilter) {
    this.selectedStockStatuses.update((currentStatuses) =>
      currentStatuses.includes(status)
        ? currentStatuses.filter((currentStatus) => currentStatus !== status)
        : [...currentStatuses, status],
    );
  }

  hasStockStatus(status: StockStatusFilter) {
    return this.selectedStockStatuses().includes(status);
  }

  clearStockStatusFilters() {
    this.selectedStockStatuses.set([]);
  }

  clearFilters() {
    this.selectedOrderGeneral.set('none');
    this.#resetStockFilters();
    this.#resetPriceFilters();
    this.clearStockStatusFilters();
  }

  updateVisibleProductsCount(count: number) {
    this.visibleProductsCount.set(count);
  }

  #parseNullableNumber(value: string) {
    if (value === '') return null;

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  #resetStockFilters() {
    this.draftMinStockFilter.set(null);
    this.draftMaxStockFilter.set(null);
    this.minStockFilter.set(null);
    this.maxStockFilter.set(null);
    this.selectedStockStatuses.set([]);
  }

  #resetPriceFilters() {
    this.selectedPriceFilterType.set('none');
    this.selectedPriceOrder.set('none');
    this.draftMinPriceFilter.set(null);
    this.draftMaxPriceFilter.set(null);
    this.minPriceFilter.set(null);
    this.maxPriceFilter.set(null);
  }
  changeOffice(event: Event) {
    this.authStore.setOfficeId(Number((event.target as HTMLSelectElement).value));
  }
}
