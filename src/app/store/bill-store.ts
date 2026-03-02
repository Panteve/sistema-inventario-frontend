import {
  patchState,
  signalStore,
  withComputed,
  withLinkedState,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { BillService } from '../services/bill.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ErrorStore } from './errors-store';
import { filter, finalize, pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { CreateBillRequest, ProductOnBill, ProductSelected } from '../interfaces/bill.interface';

type BillState = {
  productSelected: ProductSelected;
  bill: CreateBillRequest;
  loading: boolean;
};

const initialState: BillState = {
  productSelected: {
    product: { id: 0, unitPrice: 0, wholesalePrice: 0, name: '' },
    priceSelected: 0,
    quantity: 0,
  },
  bill: {
    paymentMethodId: 0,
    cashRegisterId: 1,
    products: [],
  },
  loading: false,
};

export const BillStore = signalStore(
  withState(initialState),
  withComputed(({ bill }) => ({
    subtotal: computed(
      () => bill().products?.reduce((acc, p) => acc + (p.priceUnique || 0) * p.quantity, 0) ?? 0,
    ),
    length: computed(() => bill().products?.length ?? 0),
  })),
  withLinkedState(({ subtotal }) => ({
    iva: () => subtotal() * 0.19,
    total: () => subtotal() * 1.19,
  })),
  withProps(() => ({
    billService: inject(BillService),
    errorStore: inject(ErrorStore),
    router: inject(Router),
  })),
  withMethods(({ errorStore, ...store }) => ({
    _isValidForSubmit: () => {
      if (store.length() === 0) {
        errorStore.showError('Agrega al menos un producto a la factura.');
        patchState(store, { loading: false });
        return false;
      }
      if (store.bill().paymentMethodId === 0) {
        errorStore.showError('Selecciona un método de pago.');
        patchState(store, { loading: false });
        return false;
      }
      return true;
    },
  })),
  withMethods(({ billService, errorStore, router, ...store }) => ({
    createBill: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        filter(() => store._isValidForSubmit()),
        switchMap(() =>
          billService.createBill(store.bill()).pipe(
            tap((billId) => {
              console.log(`Bill created with ID: ${billId}`);
              router.navigate([`/bill/${billId}`]);
            }),
          ),
        ),
        finalize(() => patchState(store, { loading: false })),
      ),
    ),

    cancelBill() {
      patchState(store, { bill: initialState.bill, loading: false });
    },
    setSelectedProduct(product:  ProductSelected) {
      patchState(store, { productSelected: product });
    },
    setPriceSelected(priceType: string) {
      patchState(store, (state) => ({
        productSelected: {
          ...state.productSelected,
          priceSelected:
            priceType === 'unitPrice'
              ? state.productSelected.product.unitPrice
              : state.productSelected.product.wholesalePrice || 0,
        },
      }));
    },
    addProduct() {
      const productTo: ProductOnBill = {
        productId: store.productSelected().product.id,
        name: store.productSelected().product.name,
        priceUnique: store.productSelected().priceSelected,
        quantity: 1,
        taxPercentage: 0.1,
      };
      if (!store.bill().products.some((p) => p.productId === productTo.productId)) {
        patchState(store, (state) => ({
          bill: {
            ...state.bill,
            products: [...state.bill.products, productTo],
          },
        }));
      } else {
        patchState(store, (state) => ({
          bill: {
            ...state.bill,
            products: state.bill.products.map((p) => {
              if (p.productId === productTo.productId) {
                return { ...p, quantity: p.quantity + 1 };
              }
              return p;
            }),
          },
        }));
      }
    },
    modifyQuantity(quantity: number, productId: number) {
      patchState(store, (state) => ({
        bill: {
          ...state.bill,
          products: state.bill.products.map((p) => {
            if (p.productId === productId) {
              return { ...p, quantity };
            }
            return p;
          }),
        },
      }));
    },
    modifyPrice(price: number, productId: number) {
      patchState(store, (state) => ({
        bill: {
          ...state.bill,
          products: state.bill.products.map((p) => {
            if (price < 1) {
              return p;
            }
            if (p.productId === productId) {
              return { ...p, priceUnique: Number(price) };
            }
            return p;
          }),
        },
      }));
    },
    setMethodOfPayment(paymentMethodId: number) {
      patchState(store, (state) => ({
        bill: {
          ...state.bill,
          paymentMethodId,
        },
      }));
    },
  })),
);
