import { Component, effect, ElementRef, inject, signal, ViewChild, ViewChildren } from '@angular/core';
import { ProductService } from '../../services/product.service';
import {
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/angular-table';
import { ProductInterface } from '../../interfaces/product.interface';
import { BillService } from '../../services/bill.service';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-product-panel',
  imports: [FlexRenderDirective, RouterOutlet],
  templateUrl: './product-panel.html',
  styleUrl: './product-panel.css',
})

export class ProductPanel {
  constructor() {
    effect(() => {
      if (this.productService.modalClose()) {
        this.btnCerrar.nativeElement.click();
        this.productService.modalClose.set(false);
      }
    })
  }

  private productService = inject(ProductService);
  router = inject(Router);

  @ViewChild('btnCerrar') btnCerrar!: ElementRef<HTMLButtonElement>;

  globalFilter = signal('');
  products = this.productService.products;
  error = this.productService.error;
  loading = this.productService.loading;
  numberPage = signal<number>(1);
  modalAbierto = signal<boolean>(false);

  loadProducts() {
    this.productService.loadProducts();
  }

  getProductTable(product: ProductInterface) {
    this.productService.productSelected.set(product);
    this.modalAbierto.set(true);
  }

  private currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  });

  table = createAngularTable(() => ({
    data: this.products(),
    columns: [
      {
        header: 'ID',
        accessorKey: 'id',
      },
      {
        header: 'Producto',
        accessorKey: 'name',
      },
      {
        header: 'Precio unitario',
        accessorKey: 'unitPrice',
        cell: (info) => this.currencyFormatter.format(info.getValue() as number),
      },
      {
        header: 'Precio mayorista',
        accessorKey: 'wholesalePrice',
        cell: (info) => this.currencyFormatter.format(info.getValue() as number),
      },
      {
        header: 'Stock',
        accessorKey: 'stock',
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
    globalFilterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId)).toLowerCase();
      return value.includes(filterValue.toLowerCase());
    },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 2,
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
