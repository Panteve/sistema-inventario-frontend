import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthStore } from '../../../../core/store/auth-store';
import { TableProducts } from '../../../../shared/layouts/table-products/table-products';
import {
  ProductCatalogResponse,
  ProductOnInventoryResponse,
} from '../../../../shared/interfaces/product.interface';
import { DatePipe } from '@angular/common';
import { MovementInventoryStore } from '../../store/movement-inventory-store';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ErrorStore } from '../../../../core/store/errors-store';
import { ProductStore } from '../../../../shared/store/product-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableCatalogProducts } from '../../../../shared/layouts/table-catalog-products/table-catalog-products';

@Component({
  selector: 'app-movement-create.component',
  imports: [DatePipe, TableProducts, ReactiveFormsModule, TableCatalogProducts],
  providers: [MovementInventoryStore],
  templateUrl: './movement-create.component.html',
})
export class MovementCreateComponent implements OnInit, OnDestroy {
  authStore = inject(AuthStore);
  errorStore = inject(ErrorStore);
  productStore = inject(ProductStore);
  officeStore = inject(OfficeStore);
  movementStore = inject(MovementInventoryStore);
  router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly MOVEMENTYPE = {
    IN: 'IN',
    OUT: 'OUT',
    TRANSFER: 'TRANSFER',
  };

  currentDate = Date.now();
  showCatalogProducts = computed(
    () => this.movementStore.movementData().type === this.MOVEMENTYPE.IN,
  );
  canConfirm = computed(() => {
    if (this.notSelectedOffice()) return false;
    if (this.movementStore.movementData().products.length <= 0) return false;
    return true;
  });
  notSelectedOffice = computed(() => {
    if (this.movementStore.movementData().type === this.MOVEMENTYPE.IN) {
      return this.movementStore.movementData().toOfficeId === 0;
    }
    if (this.movementStore.movementData().type === this.MOVEMENTYPE.OUT) {
      return this.movementStore.movementData().fromOfficeId === 0;
    }
    if (this.movementStore.movementData().type === this.MOVEMENTYPE.TRANSFER) {
      return (
        this.movementStore.movementData().fromOfficeId === 0 ||
        this.movementStore.movementData().toOfficeId === 0
      );
    }
    return false;
  });

  productsModalOpen = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('productsModal') === 'open')),
    { initialValue: false },
  );

  ngOnInit(): void {
    if (this.authStore.isAdmin()) {
      this.officeStore.loadOffices();
    }
    this.productStore.loadProductsCatalog();
  }

  ngOnDestroy(): void {
    this.productStore.removeCatalogProducts();
  }

  selectAll(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  openProductsModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { productsModal: 'open' },
      queryParamsHandling: 'merge',
    });
  }

  closeProductsModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { productsModal: null },
      queryParamsHandling: 'merge',
    });
  }

  getProductTableInventory(product: ProductOnInventoryResponse) {
    this.movementStore.addProductInventoryToMovement(product);
  }

  getProductTableCatalog(product: ProductCatalogResponse) {
    this.movementStore.addProductCatalogToMovement(product);
  }

  modifyingQuantity(event: Event, productId: number) {
    const quantity = (event.target as HTMLInputElement).value;
    if (quantity === '' || Number(quantity) < 1) {
      (event.target as HTMLInputElement).value = '1';
      return;
    }
    this.movementStore.modifyQuantity(Number(quantity), productId);
  }

  quitProduct(productId: number) {
    this.movementStore.quitProduct(productId);
  }

  changeMovementType(event: Event) {
    const selectElement = (event.target as HTMLSelectElement).value as 'IN' | 'OUT' | 'TRANSFER';
    this.movementStore.setMovementType(selectElement);
  }

  changeToOffice(event: Event) {
    const selectElement = (event.target as HTMLSelectElement).value;
    this.movementStore.setToOfficeId(Number(selectElement));
    if (this.movementStore.movementData().type !== this.MOVEMENTYPE.TRANSFER) {
      this.authStore.setOfficeId(Number(selectElement));
    }
  }
  changeFromOffice(event: Event) {
    const selectElement = (event.target as HTMLSelectElement).value;
    this.movementStore.setFromOfficeId(Number(selectElement));
    this.authStore.setOfficeId(Number(selectElement));
    this.productStore.loadProductsOnInventory();
    this.movementStore.resetProductsInMovement();
  }

  submitMovement() {
    if (this.movementStore.movementData().type === this.MOVEMENTYPE.IN) {
      if (this.movementStore.movementData().toOfficeId === 0) {
        this.errorStore.showError(
          'Debe seleccionar una oficina de destino para el movimiento de entrada.',
        );
        return;
      }
    } else if (this.movementStore.movementData().type === this.MOVEMENTYPE.OUT) {
      if (this.movementStore.movementData().fromOfficeId === 0) {
        this.errorStore.showError(
          'Debe seleccionar una oficina de origen para el movimiento de salida.',
        );
        return;
      }
    } else if (this.movementStore.movementData().type === this.MOVEMENTYPE.TRANSFER) {
      if (
        this.movementStore.movementData().fromOfficeId === 0 ||
        this.movementStore.movementData().toOfficeId === 0
      ) {
        this.errorStore.showError(
          'Debe seleccionar una oficina de origen y destino para el movimiento de transferencia.',
        );
        return;
      }
    }
    this.movementStore.createMovementInventory();
  }
}
