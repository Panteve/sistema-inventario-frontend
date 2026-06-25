import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  CellContext,
  ColumnFiltersState,
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/angular-table';
import { InventoryStore } from '../../store/inventory-store';
import { ProductOnInventoryResponse } from '../../interfaces/product.interface';
import { CopPipe } from '../../pipes/cop.pipes';

type PriceColumnId = 'unitPrice' | 'wholesalePrice';
type PriceOrderType = 'none' | 'asc' | 'desc';
type StockStatusFilter = 'normal' | 'low' | 'out';
type RangeFilterValue = {
  min: number | null;
  max: number | null;
  statuses?: StockStatusFilter[];
};

@Component({
  selector: 'app-table-products',
  imports: [FlexRenderDirective],
  providers: [CopPipe],
  templateUrl: './table-products.html',
  styleUrl: './table-products.css',
})
export class TableProducts {
  enableRowSelect = input<boolean>(false);
  quantityProducts = input<number>(10);
  enableStockStatus = input<boolean>(false);
  lowStockThreshold = input<number>(5);
  selectedOrderGeneral = input<string>('none');
  minStockFilter = input<number | null>(null);
  maxStockFilter = input<number | null>(null);
  selectedPriceFilterType = input<PriceColumnId | 'none'>('none');
  selectedPriceOrder = input<PriceOrderType>('none');
  minPriceFilter = input<number | null>(null);
  maxPriceFilter = input<number | null>(null);
  selectedStockStatuses = input<StockStatusFilter[]>([]);
  isActiveProducts = input<boolean>(true);
  rowSelected = output<ProductOnInventoryResponse>();
  filteredProductsCountChanged = output<number>();

  inventoryStore = inject(InventoryStore);
  copPipe = inject(CopPipe);

  globalFilter = signal<string>('');
  numberPage = signal<number>(1);
  #lastProductsFilteredCount = signal<number>(-1);

  #createRangeFilter(columnId: string, min: number | null, max: number | null) {
    return {
      id: columnId,
      value: { min, max },
    };
  }

  #createStockFilter(min: number | null, max: number | null, statuses: StockStatusFilter[]) {
    return {
      id: 'quantity',
      value: { min, max, statuses },
    };
  }

  #getGeneralSortingRules(option: string): SortingState {
    if (option === 'name-asc') return [{ id: 'name', desc: false }];
    if (option === 'name-desc') return [{ id: 'name', desc: true }];
    if (option === 'quantity-asc') return [{ id: 'quantity', desc: false }];
    if (option === 'quantity-desc') return [{ id: 'quantity', desc: true }];
    return [];
  }

  #matchesStockStatus(quantity: number, status: StockStatusFilter) {
    if (status === 'normal') return quantity > this.lowStockThreshold();
    if (status === 'low') return quantity > 0 && quantity <= this.lowStockThreshold();
    return quantity <= 0;
  }

  #matchesAnyStockStatus(quantity: number, statuses: StockStatusFilter[]) {
    if (statuses.length === 0) return true;
    return statuses.some((status) => this.#matchesStockStatus(quantity, status));
  }

  #matchesRangeFilter(filterValue: RangeFilterValue, value: number) {
    const min = filterValue?.min ?? null;
    const max = filterValue?.max ?? null;
    return this.#isValueInRange(value, min, max);
  }

  #rangeFilterFn = (row: any, columnId: string, filterValue: RangeFilterValue) => {
    const value = row.getValue(columnId) as number;
    return this.#matchesRangeFilter(filterValue, value);
  };

  #stockFilterFn = (row: any, columnId: string, filterValue: RangeFilterValue) => {
    const quantity = row.getValue(columnId) as number;
    const statuses = filterValue?.statuses ?? [];

    if (!this.#matchesRangeFilter(filterValue, quantity)) return false;
    return this.#matchesAnyStockStatus(quantity, statuses);
  };

  #isValueInRange(value: number, min: number | null, max: number | null) {
    if (min !== null && value < min) return false;
    if (max !== null && value > max) return false;
    return true;
  }

  sorting = computed<SortingState>(() => {
    const selectedPriceOrder = this.selectedPriceOrder();
    const selectedPriceFilterType = this.selectedPriceFilterType();
    const sortingRules: SortingState = [
      ...this.#getGeneralSortingRules(this.selectedOrderGeneral()),
    ];

    if (selectedPriceFilterType !== 'none' && selectedPriceOrder !== 'none') {
      sortingRules.unshift({
        id: selectedPriceFilterType,
        desc: selectedPriceOrder === 'desc',
      });
    }

    return sortingRules;
  });

  columnFilters = computed<ColumnFiltersState>(() => {
    const min = this.minStockFilter();
    const max = this.maxStockFilter();
    const selectedStockStatuses = this.selectedStockStatuses();
    const selectedPriceFilterType = this.selectedPriceFilterType();
    const minPrice = this.minPriceFilter();
    const maxPrice = this.maxPriceFilter();
    const filters: ColumnFiltersState = [];

    if (min !== null || max !== null || selectedStockStatuses.length > 0) {
      filters.push(this.#createStockFilter(min, max, selectedStockStatuses));
    }

    if (selectedPriceFilterType !== 'none' && (minPrice !== null || maxPrice !== null)) {
      filters.push(this.#createRangeFilter(selectedPriceFilterType, minPrice, maxPrice));
    }

    return filters;
  });

  constructor() {
    effect(() => {
      this.selectedOrderGeneral();
      this.minStockFilter();
      this.maxStockFilter();
      this.selectedStockStatuses();
      this.selectedPriceFilterType();
      this.selectedPriceOrder();
      this.minPriceFilter();
      this.maxPriceFilter();
      this.resetViewTable();
    });
    effect(() => {
      this.table.setPageSize(this.quantityProducts());
    });
    effect(() => {
      this.inventoryStore.products();
      this.globalFilter();
      this.columnFilters();
      this.sorting();

      const filteredCount = this.table.getFilteredRowModel().rows.length;
      if (filteredCount === this.#lastProductsFilteredCount()) return;

      this.#lastProductsFilteredCount.set(filteredCount);
      this.filteredProductsCountChanged.emit(filteredCount);
    });
  }

  onRowClick(product: ProductOnInventoryResponse) {
    if (!this.enableRowSelect) return;
    this.rowSelected.emit(product);
  }
  isStockCell(columnId: string) {
    return columnId === 'quantity';
  }
  isNegativeStock(quantity: number) {
    return this.enableStockStatus() && quantity <= 0;
  }
  isLowStock(quantity: number) {
    return this.enableStockStatus() && quantity > 0 && quantity <= this.lowStockThreshold();
  }
  loadProducts() {
    this.globalFilter.set('');
    this.inventoryStore.loadProductsOnInventory(this.isActiveProducts());
  }

  table = createAngularTable(() => ({
    data: this.inventoryStore.products(),
    columns: [
      {
        header: 'Producto',
        accessorKey: 'product.name',
        id: 'name',
      },
      {
        header: 'Precio unitario',
        accessorKey: 'product.unitPrice',
        id: 'unitPrice',
        filterFn: this.#rangeFilterFn,
        cell: (info: CellContext<ProductOnInventoryResponse, any>) =>
          this.copPipe.transform(info.getValue()),
      },
      {
        header: 'Precio mayorista',
        accessorKey: 'product.wholesalePrice',
        id: 'wholesalePrice',
        filterFn: this.#rangeFilterFn,
        cell: (info: CellContext<ProductOnInventoryResponse, any>) =>
          this.copPipe.transform(info.getValue()),
      },
      {
        header: 'Stock',
        accessorKey: 'quantity',
        id: 'quantity',
        filterFn: this.#stockFilterFn,
      },
    ],
    state: {
      globalFilter: this.globalFilter(),
      sorting: this.sorting(),
      columnFilters: this.columnFilters(),
    },
    onGlobalFilterChange: (value) => {
      this.globalFilter.set(value as string);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId)).toLowerCase();
      return value.includes(filterValue.toLowerCase());
    },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: this.quantityProducts(),
      },
    },
  }));

  resetViewTable() {
    this.table.setPageIndex(0);
    this.numberPage.set(1);
  }

  nextPage() {
    this.table.nextPage();
    this.numberPage.update((n) => n + 1);
  }

  previousPage() {
    this.table.previousPage();
    this.numberPage.update((n) => n - 1);
  }
}
