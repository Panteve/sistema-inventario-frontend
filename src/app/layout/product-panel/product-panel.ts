import { Component, inject, signal } from '@angular/core';
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
@Component({
  selector: 'app-product-panel',
  imports: [FlexRenderDirective],
  templateUrl: './product-panel.html',
  styleUrl: './product-panel.css',
})
export class ProductPanel {
  private productService = inject(ProductService);
  private billService = inject(BillService);

  globalFilter = signal('');
  products = this.productService.products.asReadonly();
  error = this.productService.error.asReadonly();
  loading = this.productService.loading.asReadonly();
  numberPage = signal<number>(1);

  loadProducts() {
    this.productService.loadProducts();
  }

  getProductTable(product: ProductInterface) {
    this.billService.productsOnBill.update((products) => [...products, product]);
  }



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
      },
      {
        header: 'Precio mayorista',
        accessorKey: 'wholesalePrice',
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

  nextPage() {
    this.table.nextPage();
    this.numberPage.update((n) => n + 1);
  }
  
  previousPage() {
    this.table.previousPage();
    this.numberPage.update((n) => n - 1);
  }
}
