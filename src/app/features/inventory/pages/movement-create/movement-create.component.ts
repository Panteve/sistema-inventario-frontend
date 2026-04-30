import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { ProductStore } from '../../../../shared/store/product-store';
import { OfficeStore } from '../../../../shared/store/office-store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableCatalogProducts } from '../../../../shared/layouts/table-catalog-products/table-catalog-products';
import { ToastService } from '../../../../shared/services/toast.service';
import { CreateInventoryMovementRequest } from '../../../../shared/interfaces/inventoryMovement.interface';
import { ProductCatalogStore } from '../../../../shared/store/product-catalog-store';

@Component({
  selector: 'app-movement-create.component',
  imports: [DatePipe, TableProducts, ReactiveFormsModule, TableCatalogProducts],
  providers: [MovementInventoryStore],
  templateUrl: './movement-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementCreateComponent implements OnInit{
  
  authStore = inject(AuthStore);
  productStore = inject(ProductStore);
  productCatalogStore = inject(ProductCatalogStore);
  officeStore = inject(OfficeStore);
  movementStore = inject(MovementInventoryStore);
  toastService = inject(ToastService);
  router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly MOVEMENTYPE = {
    IN: 'IN',
    OUT: 'OUT',
    TRANSFER: 'TRANSFER',
  };
  reason = new FormControl('');
  currentDate = Date.now();

  movementData = signal<CreateInventoryMovementRequest>({
    toOfficeId: 0,
    fromOfficeId: 0,
    type: this.MOVEMENTYPE.IN as 'IN' | 'OUT' | 'TRANSFER',
    reason: '',
    products: [],
  });

  canConfirm = computed(() => {
    if (this.notSelectedOffice()) return false;
    if (this.movementData().products.length <= 0) return false;
    return true;
  });
  notSelectedOffice = computed(() => {
    if (!this.authStore.isAdmin()) return false;
    if (this.movementData().type === this.MOVEMENTYPE.IN) {
      return this.movementData().toOfficeId === 0;
    }
    if (this.movementData().type === this.MOVEMENTYPE.OUT) {
      return this.movementData().fromOfficeId === 0;
    }
    if (this.movementData().type === this.MOVEMENTYPE.TRANSFER) {
      return this.movementData().fromOfficeId === 0 || this.movementData().toOfficeId === 0;
    }
    return false;
  });

  productsModalOpen = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('productsModal') === 'open')),
    { initialValue: false },
  );

  ngOnInit(): void {
    this.productCatalogStore.loadProductsCatalog(false);
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

  ngOnDestroy(): void {
    if (this.authStore.isAdmin()) {
      this.authStore.resetOfficeIdFromCashRegister();
    }
  }

  selectAll(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }
  //HACER QUE LA INTERFACES DE PRODUCTO DE INVENTARIO Y CATALOGO SEAN LA MISMA PARA NO TENER QUE TENER DOS FUNCIONES PARA AGREGAR PRODUCTOS AL MOVIMIENTO DE INVENTARIO
  addProductInventoryToMovement(product: ProductOnInventoryResponse) {
    const exists = this.movementData().products.some((p) => p.productId === product.product.id);

    if (!exists) {
      this.movementData.update((data) => ({
        ...data,
        products: [
          ...data.products,
          { productId: product.product.id, name: product.product.name, quantity: 1 },
        ],
      }));
    } else {
      this.movementData.update((data) => ({
        ...data,
        products: data.products.map((p) =>
          p.productId === product.product.id ? { ...p, quantity: p.quantity + 1 } : p,
        ),
      }));
    }
    this.toastService.show({
      title: 'Producto agregado',
      content: `El producto ${product.product.name} ha sido agregado al movimiento de inventario.`,
      type: 'success',
      duration: 3000,
    });
  }
  addProductCatalogToMovement(product: ProductCatalogResponse) {
    const exists = this.movementData().products.some((p) => p.productId === product.id);

    if (!exists) {
      this.movementData.update((data) => ({
        ...data,
        products: [...data.products, { productId: product.id, name: product.name, quantity: 1 }],
      }));
    } else {
      this.movementData.update((data) => ({
        ...data,
        products: data.products.map((p) =>
          p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p,
        ),
      }));
    }
    this.toastService.show({
      title: 'Producto agregado',
      content: `El producto ${product.name} ha sido agregado al movimiento de inventario.`,
      type: 'success',
      duration: 3000,
    });
  }
  modifyingQuantity(event: Event, productId: number) {
    const quantity = Number((event.target as HTMLInputElement).value);
    if (quantity < 1) {
      (event.target as HTMLInputElement).value = '1';
      return;
    }
    this.movementData.update((data) => ({
      ...data,
      products: data.products.map((p) => (p.productId === productId ? { ...p, quantity } : p)),
    }));
  }
  quitProduct(productId: number) {
    this.movementData.update((data) => ({
      ...data,
      products: data.products.filter((p) => p.productId !== productId),
    }));
  }
  changeMovementType(event: Event) {
    const selectElement = (event.target as HTMLSelectElement).value as 'IN' | 'OUT' | 'TRANSFER';
    this.movementData.update((data) => ({
      ...data,
      type: selectElement,
    }));
    this.resetMovementData();
  }
  resetMovementData() {
    this.movementData.update((data) => ({
      ...data,
      toOfficeId: 0,
      fromOfficeId: 0,
      products: [],
    }));
  }
  changeToOffice(event: Event) {
    const selectElement = Number((event.target as HTMLSelectElement).value);
    this.movementData.update((data) => ({
      ...data,
      toOfficeId: selectElement,
    }));
    if (this.movementData().type === this.MOVEMENTYPE.OUT) {
      this.authStore.setOfficeId(Number(selectElement));
    }
  }
  changeFromOffice(event: Event) {
    const selectElement = Number((event.target as HTMLSelectElement).value);
    this.movementData.update((data) => ({
      ...data,
      fromOfficeId: selectElement,
      products: [],
    }));
    this.authStore.setOfficeId(selectElement);
  }

  submitMovement() {
    if (this.authStore.isAdmin()) {
      if (this.movementData().type === this.MOVEMENTYPE.IN) {
        if (this.movementData().toOfficeId === 0) {
          this.toastService.show({
            title: 'Falta oficina de destino',
            content: 'Debe seleccionar una oficina de destino para el movimiento de entrada.',
            type: 'error',
          });
          return;
        }
      } else if (this.movementData().type === this.MOVEMENTYPE.OUT) {
        if (this.movementData().fromOfficeId === 0) {
          this.toastService.show({
            title: 'Falta oficina de origen',
            content: 'Debe seleccionar una oficina de origen para el movimiento de salida.',
            type: 'error',
          });
          return;
        }
      } else if (this.movementData().type === this.MOVEMENTYPE.TRANSFER) {
        if (this.movementData().fromOfficeId === 0 || this.movementData().toOfficeId === 0) {
          this.toastService.show({
            title: 'Falta oficina de origen o destino',
            content:
              'Debe seleccionar una oficina de origen y destino para el movimiento de transferencia.',
            type: 'error',
          });
          return;
        } else if (this.movementData().fromOfficeId === this.movementData().toOfficeId) {
          this.toastService.show({
            title: 'Oficinas iguales',
            content: 'La oficina de origen y destino no pueden ser la misma.',
            type: 'error',
          });
          return;
        }
      }
    }
    if (this.movementData().products.length <= 0) {
      this.toastService.show({
        title: 'Faltan productos',
        content: 'Debe agregar al menos un producto para el movimiento de transferencia.',
        type: 'error',
      });
      return;
    }
    if (this.movementData().reason.trim() === '') {
      this.toastService.show({
        title: 'Falta razón del movimiento',
        content: 'Debe ingresar una razón para el movimiento de transferencia.',
        type: 'error',
      });
      return;
    }
    this.movementStore.createMovementInventory(this.movementData());
  }

  setReason(event: Event) {
    const reason = (event.target as HTMLTextAreaElement).value;

    this.movementData.update((data) => ({
      ...data,
      reason,
    }));
  }
}
