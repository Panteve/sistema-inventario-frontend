import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/angular-table';
import { ProductCatalogResponse } from '../../interfaces/product.interface';
import { CopPipe } from '../../pipes/cop.pipes';
import { ProductCatalogStore } from '../../store/product-catalog-store';

type PriceColumnId = 'unitPrice' | 'wholesalePrice';
type PriceOrderType = 'none' | 'asc' | 'desc';
type StockStatusFilter = 'normal' | 'low' | 'out';
type RangeFilterValue = {
  min: number | null;
  max: number | null;
  statuses?: StockStatusFilter[];
};

@Component({
  selector: 'app-table-catalog-products',
  imports: [FlexRenderDirective],
  providers: [CopPipe],
  templateUrl: './table-catalog-products.html',
  styleUrl: './table-catalog-products.css',
})
export class TableCatalogProducts {
  quantityProducts = input<number>(10);
  selectedOrderGeneral = input<string>('none');
  selectedPriceFilterType = input<PriceColumnId | 'none'>('none');
  selectedPriceOrder = input<PriceOrderType>('none');
  minPriceFilter = input<number | null>(null);
  maxPriceFilter = input<number | null>(null);
  rowSelected = output<ProductCatalogResponse>();
  filteredProductsCountChanged = output<number>();
  manageProduct = input<boolean>(false);
  showDelete = input<boolean>(false);

  productCatalogStore = inject(ProductCatalogStore);
  copPipe = inject(CopPipe);

  globalFilter = signal<string>('');
  numberPage = signal<number>(1);
  #lastFilteredCount = signal<number>(-1);

  #rangeFilterFn = (row: any, columnId: string, filterValue: RangeFilterValue) => {
    const value = row.getValue(columnId) as number;
    return this.#matchesRangeFilter(filterValue, value);
  };

  #createRangeFilter(columnId: string, min: number | null, max: number | null) {
    return {
      id: columnId,
      value: { min, max },
    };
  }

  #getGeneralSortingRules(option: string): SortingState {
    if (option === 'name-asc') return [{ id: 'name', desc: false }];
    if (option === 'name-desc') return [{ id: 'name', desc: true }];
    return [];
  }

  #matchesRangeFilter(filterValue: RangeFilterValue, value: number) {
    const min = filterValue?.min ?? null;
    const max = filterValue?.max ?? null;
    return this.#isValueInRange(value, min, max);
  }

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
    const selectedPriceFilterType = this.selectedPriceFilterType();
    const minPrice = this.minPriceFilter();
    const maxPrice = this.maxPriceFilter();
    const filters: ColumnFiltersState = [];

    if (selectedPriceFilterType !== 'none' && (minPrice !== null || maxPrice !== null)) {
      filters.push(this.#createRangeFilter(selectedPriceFilterType, minPrice, maxPrice));
    }

    return filters;
  });

  constructor() {
    effect(() => {
      this.selectedOrderGeneral();
      this.selectedPriceFilterType();
      this.selectedPriceOrder();
      this.minPriceFilter();
      this.maxPriceFilter();
      this.productCatalogStore.catalogProducts();

      this.resetViewTable();
    });
    effect(() => {
      this.table.setPageSize(this.quantityProducts());
    });
    effect(() => {
      this.productCatalogStore.catalogProducts();
      this.globalFilter();
      this.columnFilters();
      this.sorting();

      const filteredCount = this.table.getFilteredRowModel().rows.length;
      if (filteredCount === this.#lastFilteredCount()) return;

      this.#lastFilteredCount.set(filteredCount);
      this.filteredProductsCountChanged.emit(filteredCount);
    });
  }

  onRowClick(product: ProductCatalogResponse) {
    this.rowSelected.emit(product);
  }

  loadProducts() {
    this.globalFilter.set('');
    this.productCatalogStore.loadProductsCatalog({ showDelete: this.showDelete(), refresh: false });
  }
  columns = computed(() => {
    const columns: ColumnDef<ProductCatalogResponse, any>[] = [
      {
        header: 'Producto',
        accessorKey: 'name',
        id: 'name',
      },
      {
        header: 'Precio unitario',
        accessorKey: 'unitPrice',
        id: 'unitPrice',
        filterFn: this.#rangeFilterFn,
        cell: (info: CellContext<ProductCatalogResponse, any>) =>
          this.copPipe.transform(info.getValue()),
      },
      {
        header: 'Precio mayorista',
        accessorKey: 'wholesalePrice',
        id: 'wholesalePrice',
        filterFn: this.#rangeFilterFn,
        cell: (info: CellContext<ProductCatalogResponse, any>) =>
          this.copPipe.transform(info.getValue()),
      },
    ];
    if (this.manageProduct()) {
      columns.push({
        header: 'Status',
        accessorKey: 'status',
        id: 'status',
      });
    }
    return columns;
  });
  table = createAngularTable(() => ({
    data: this.productCatalogStore.catalogProducts(),
    columns: this.columns(),
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
    getColumnCanGlobalFilter: (column) => {
      return !!column.accessorFn;
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (columnId === 'status') {
        const statusText = row.getValue(columnId) ? 'activo' : 'inactivo';
        return statusText.includes(filterValue.toLowerCase());
      }
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
