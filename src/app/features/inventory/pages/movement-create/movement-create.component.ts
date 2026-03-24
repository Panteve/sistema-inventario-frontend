import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { AuthStore } from '../../../../core/store/auth-store';
import { TableProducts } from '../../../../shared/layouts/table-products/table-products';
import { ProductOnInventoryResponse } from '../../../../shared/interfaces/product.interface';
import { DatePipe } from '@angular/common';
import { MovementInventoryStore } from '../../store/movement-inventory-store';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ErrorStore } from '../../../../core/store/errors-store';
import { ProductStore } from '../../../../shared/store/product-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-movement-create.component',
  imports: [DatePipe, TableProducts, ReactiveFormsModule],
  providers: [MovementInventoryStore, OfficeStore],
  templateUrl: './movement-create.component.html',
})
export class MovementCreateComponent implements OnInit {
  constructor() {
    effect(() => {
      if (!this.officeStore.loading()) {
        this.movementStore.setToOfficeId(this.officeStore.offices()[0]?.id ?? 0);
        this.movementStore.setFromOfficeId(this.officeStore.offices()[0]?.id ?? 0);
      }
    });
  }
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
  showCatalogProducts = signal<boolean>(true);
  movementTypeChoose = signal<string>(this.MOVEMENTYPE.IN);
  currentDate = Date.now();
  canConfirm = computed(() => {
    if (!this.movementTypeChoose()) return false;
    if (this.movementStore.movementData().products.length <= 0) return false;
    return true;
  });

  productsModalOpen = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('productsModal') === 'open')),
    { initialValue: false },
  );

  toOfficeId = new FormControl<number>(0);
  fromOfficeId = new FormControl<number>(0);

  ngOnInit(): void {
    if (this.authStore.isAdmin()) {
      this.officeStore.loadOffices();
    }
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

  getProductTable(product: ProductOnInventoryResponse) {
    this.movementStore.addProductToMovement(product);
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
    if (selectElement !== this.MOVEMENTYPE.IN) {
      this.showCatalogProducts.set(false);
    } else {
      this.showCatalogProducts.set(true);
    }
    this.movementStore.setMovementType(selectElement);
    this.resetMovementData();
  }

  changeToOffice(event: Event) {
    const selectElement = (event.target as HTMLSelectElement).value;
    this.toOfficeId.setValue(Number(selectElement));
  }
  changeFromOffice(event: Event) {
    const selectElement = (event.target as HTMLSelectElement).value;
    this.fromOfficeId.setValue(Number(selectElement));
  }

  resetMovementData() {
    this.movementStore.resetMovementData();
    this.toOfficeId.setValue(0);
    this.fromOfficeId.setValue(0);
  }

  submitMovement() {
    if(this.movementTypeChoose() === this.MOVEMENTYPE.IN ){
      if(this.toOfficeId.value === 0){
        this.errorStore.showError('Debe seleccionar una oficina de destino para el movimiento de entrada.');
        return;
      }
    }else if(this.movementTypeChoose() === this.MOVEMENTYPE.OUT){
      if(this.fromOfficeId.value === 0){
        this.errorStore.showError('Debe seleccionar una oficina de origen para el movimiento de salida.');
        return;
      }
    }else if(this.movementTypeChoose() === this.MOVEMENTYPE.TRANSFER){
      if(this.fromOfficeId.value === 0 || this.toOfficeId.value === 0){
        this.errorStore.showError('Debe seleccionar una oficina de origen y destino para el movimiento de transferencia.');
        return;
      }
    }
    this.movementStore.setFromOfficeId(this.fromOfficeId.value ?? 0);
    this.movementStore.setToOfficeId(this.toOfficeId.value ?? 0);
    this.movementStore.createMovementInventory();
  }
}
