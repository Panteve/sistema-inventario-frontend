import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ProductService } from '../../services/product.service';
import {
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/angular-table';
import { ProductResponse } from '../../interfaces/product.interface';
import { ProductSelected } from '../../interfaces/bill.interface';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { ProductStore } from '../../store/product-store';
import { ErrorStore } from '../../store/errors-store';
import { BillStore } from '../../store/bill-store';

@Component({
  selector: 'app-product-panel',
  imports: [FlexRenderDirective, RouterOutlet, RouterLinkWithHref],
  providers: [],
  templateUrl: './product-panel.html',
  styleUrl: './product-panel.css',
})
export class ProductPanel {
  constructor() {
    effect(() => {
      if (this.productService.modalClose()) {
        this.btnCerrar.nativeElement.click();
        
      }
    });
  }

  private productService = inject(ProductService);
  productStore = inject(ProductStore);
  billStore = inject(BillStore);
  errorStore = inject(ErrorStore);
  router = inject(Router);

  globalFilter = signal<string>('');
  numberPage = signal<number>(1);
  @ViewChild('btnCerrar') btnCerrar!: ElementRef<HTMLButtonElement>;

  loadProducts() {
    this.globalFilter.set('');
    this.productStore.loadProducts();
  }

  getProductTable(product: ProductResponse) {
    this.productService.modalClose.set(false);
    const productSelected: ProductSelected = {
      product: {
        id: product.product.id,
        name: product.product.name,
        unitPrice: product.product.unitPrice,
        wholesalePrice: product.product.wholesalePrice,
      },
      priceSelected: 0,
      quantity: 0,
    };
    this.billStore.setSelectedProduct(productSelected);
  }

  private currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  });

  table = createAngularTable(() => ({
    data: this.productStore.products(),
    columns: [
      {
        header: 'ID',
        accessorKey: 'product.id',
      },
      {
        header: 'Producto',
        accessorKey: 'product.name',
      },
      {
        header: 'Precio unitario',
        accessorKey: 'product.unitPrice',
        cell: (info) => this.currencyFormatter.format(info.getValue() as number),
      },
      {
        header: 'Precio mayorista',
        accessorKey: 'product.wholesalePrice',
        cell: (info) => this.currencyFormatter.format(info.getValue() as number),
      },
      {
        header: 'Stock',
        accessorKey: 'quantity',
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
        pageSize: 5,
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
