import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TableCatalogProducts } from '../../../../shared/layouts/table-catalog-products/table-catalog-products';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CreateProductRequest,
  ProductCatalogResponse,
} from '../../../../shared/interfaces/product.interface';
import { ProductService } from '../../../../shared/services/product.service';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { CopMoneyInputDirective } from '../../../../shared/directives/cop-money-input.directive';
import { ProductCatalogStore } from '../../../../shared/store/product-catalog-store';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-products.component',
  imports: [TableCatalogProducts, ReactiveFormsModule, CopMoneyInputDirective],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  productCatalogStore = inject(ProductCatalogStore);
  productService = inject(ProductService);
  #toastService = inject(ToastService);
  #destroyRef = inject(DestroyRef);

  productForm = new FormGroup({
    id: new FormControl<number>(0, {
      nonNullable: true,
    }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[\p{L}\p{N}_ ]+$/u)],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[\p{L}\p{N}_\s]+$/u)],
    }),
    unitPrice: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    unitPriceCalculated: new FormControl<number>(0, {
      nonNullable: true,
    }),
    wholesalePrice: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    wholesalePriceCalculated: new FormControl<number>(0, {
      nonNullable: true,
    }),
    taxPercentage: new FormControl<number>(19, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(0|5|19)$/)],
    }),
    status: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
  });

  productExist = computed(() => this.productSelected() !== null);
  loading = signal<boolean>(false);
  productSelected = signal<ProductCatalogResponse | null>(null);

  #syncing = false;

  #formValue = toSignal(this.productForm.valueChanges, {
    initialValue: this.productForm.getRawValue(),
  });

  hasChanges = computed(() => {
    const selected = this.productSelected();
    const formValue = this.#formValue();
    if (selected) {
      return (
        selected.name !== formValue.name ||
        selected.description !== formValue.description ||
        selected.unitPrice !== formValue.unitPrice ||
        selected.wholesalePrice !== formValue.wholesalePrice ||
        selected.taxPercentage !== formValue.taxPercentage ||
        selected.status !== formValue.status
      );
    }
    return true;
  });

  constructor() {
    effect(() => {
      if (!this.productExist()) {
        this.productForm.get('status')?.setValue(true);
        this.productForm.get('status')?.disable();
      } else {
        this.productForm.get('status')?.enable();
      }
    });
  }

  ngOnInit(): void {
    this.productForm
      .get('status')
      ?.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        if (value) {
          if (this.productSelected()?.status === true) {
            this.productForm.get('name')?.enable({ emitEvent: false });
            this.productForm.get('description')?.enable({ emitEvent: false });
            this.productForm.get('unitPrice')?.enable({ emitEvent: false });
            this.productForm.get('unitPriceCalculated')?.enable({ emitEvent: false });
            this.productForm.get('wholesalePrice')?.enable({ emitEvent: false });
            this.productForm.get('wholesalePriceCalculated')?.enable({ emitEvent: false });
          }
        } else {
          this.productForm.get('name')?.disable({ emitEvent: false });
          this.productForm
            .get('name')
            ?.setValue(this.productSelected()?.name ?? '', { emitEvent: false });
          this.productForm.get('description')?.disable({ emitEvent: false });
          this.productForm
            .get('description')
            ?.setValue(this.productSelected()?.description ?? '', { emitEvent: false });
          this.productForm.get('unitPrice')?.disable({ emitEvent: false });
          this.productForm
            .get('unitPrice')
            ?.setValue(this.productSelected()?.unitPrice ?? 0, { emitEvent: false });
          this.productForm.get('unitPriceCalculated')?.disable({ emitEvent: false });
          this.productForm.get('wholesalePrice')?.disable({ emitEvent: false });
          this.productForm
            .get('wholesalePrice')
            ?.setValue(this.productSelected()?.wholesalePrice ?? 0, { emitEvent: false });
          this.productForm.get('wholesalePriceCalculated')?.disable({ emitEvent: false });
        }
      });

    this.#setupPriceSync();
  }

  clearProductSelected(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target || this.productSelected() === null) {
      return;
    }

    if (
      target.closest(
        'button, input, select, textarea, label, a, tr, td, th, dialog, [data-exception]',
      )
    ) {
      return;
    }
    this.onProductFormReset();
  }

  setProductSelected(product: ProductCatalogResponse) {
    if (product.id === this.productSelected()?.id) {
      return this.onProductFormReset();
    }
    this.productSelected.set(product);
    const calc = (base: number) => Math.round(base * (1 + product.taxPercentage / 100));

    this.productForm.setValue({
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      unitPrice: product.unitPrice,
      unitPriceCalculated: calc(product.unitPrice),
      wholesalePrice: product.wholesalePrice,
      wholesalePriceCalculated: calc(product.wholesalePrice),
      taxPercentage: product.taxPercentage,
      status: product.status,
    });
  }

  onProductFormReset(): void {
    this.productSelected.set(null);
    this.productForm.reset();
  }

  #setupPriceSync() {
    const taxCtrl = this.productForm.get('taxPercentage')!;
    const unitCtrl = this.productForm.get('unitPrice')!;
    const unitCalcCtrl = this.productForm.get('unitPriceCalculated')!;
    const wholeCtrl = this.productForm.get('wholesalePrice')!;
    const wholeCalcCtrl = this.productForm.get('wholesalePriceCalculated')!;

    const calcFromBase = (base: number, tax: number) => Math.round(base * (1 + tax / 100));
    const calcBase = (total: number, tax: number) =>
      tax > 0 ? Math.round(total / (1 + tax / 100)) : 0;

    taxCtrl.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((tax) => {
      if (this.#syncing) return;
      this.#syncing = true;
      unitCalcCtrl.setValue(calcFromBase(unitCtrl.value ?? 0, tax ?? 0), { emitEvent: false });
      wholeCalcCtrl.setValue(calcFromBase(wholeCtrl.value ?? 0, tax ?? 0), { emitEvent: false });
      this.#syncing = false;
    });

    unitCtrl.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((val) => {
      if (this.#syncing) return;
      this.#syncing = true;
      unitCalcCtrl.setValue(calcFromBase(val ?? 0, taxCtrl.value ?? 0));
      this.#syncing = false;
    });

    unitCalcCtrl.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((val) => {
      if (this.#syncing) return;
      this.#syncing = true;
      unitCtrl.setValue(calcBase(val ?? 0, taxCtrl.value ?? 0));
      this.#syncing = false;
    });

    wholeCtrl.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((val) => {
      if (this.#syncing) return;
      this.#syncing = true;
      wholeCalcCtrl.setValue(calcFromBase(val ?? 0, taxCtrl.value ?? 0));
      this.#syncing = false;
    });

    wholeCalcCtrl.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((val) => {
      if (this.#syncing) return;
      this.#syncing = true;
      wholeCtrl.setValue(calcBase(val ?? 0, taxCtrl.value ?? 0));
      this.#syncing = false;
    });
  }

  #setStatus(product: ProductCatalogResponse) {
    this.productService
      .setStatusProduct(product.id, product.status)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          const action = product.status ? 'activado' : 'desactivado';
          this.#toastService.show({
            title: `Producto ${action}`,
            content: `El producto ${product.name} ha sido ${action} exitosamente.`,
            type: 'success',
          });
          this.onProductFormReset();
          this.productCatalogStore.changeProductOnCatalog(product);
        },
        error: () => {
          const action = product.status ? 'activar' : 'desactivar';
          this.#toastService.show({
            title: `Error al ${action} producto`,
            content: `No se pudo ${action} el producto. Inténtalo de nuevo.`,
            type: 'error',
          });
        },
      });
  }

  #updateProduct(product: ProductCatalogResponse) {
    const payload: Partial<CreateProductRequest> = {};
    const currentProduct = this.productSelected();
    if (product.name !== currentProduct?.name) {
      payload['name'] = product.name;
    }
    if (product.description !== currentProduct?.description) {
      payload['description'] = product.description;
    }
    if (product.unitPrice !== currentProduct?.unitPrice) {
      payload['unitPrice'] = product.unitPrice;
    }
    if (product.wholesalePrice !== currentProduct?.wholesalePrice) {
      payload['wholesalePrice'] = product.wholesalePrice;
    }
    if (product.taxPercentage !== currentProduct?.taxPercentage) {
      payload['taxPercentage'] = product.taxPercentage;
    }
    this.productService
      .updateProduct(product.id, payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.#toastService.show({
            title: 'Producto actualizado',
            content: `El producto ${product.name} ha sido actualizado exitosamente.`,
            type: 'success',
          });
          this.onProductFormReset();
          this.productCatalogStore.changeProductOnCatalog(product);
        },
        error: () => {
          this.#toastService.show({
            title: 'Error al actualizar producto',
            content: 'No se pudo actualizar el producto. Inténtalo de nuevo.',
            type: 'error',
          });
        },
      });
  }

  #createProduct(product: ProductCatalogResponse) {
    const { id, status, ...productData } = product;
    this.productService
      .createProduct(productData)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (createdProduct) => {
          this.#toastService.show({
            title: 'Producto creado',
            content: `El producto ${product.name} ha sido creado exitosamente.`,
            type: 'success',
          });
          this.onProductFormReset();
          this.productCatalogStore.addProductOnCatalog(createdProduct);
        },
        error: () => {
          this.#toastService.show({
            title: 'Error al crear producto',
            content: `No se pudo crear el producto. Inténtalo de nuevo.`,
            type: 'error',
          });
        },
      });
  }

  onSubmit() {
    this.loading.set(true);
    const product = this.productForm.getRawValue();
    const { unitPriceCalculated, wholesalePriceCalculated, ...productData } = product;
    if (this.productExist()) {
      if (productData.status !== this.productSelected()?.status) {
        this.#setStatus(productData);
      } else {
        this.#updateProduct(productData);
      }
    } else {
      this.#createProduct(productData);
    }
  }
  changeShowInactive(value: boolean) {
    this.productCatalogStore.setShowingInactive(value);
  }
}
