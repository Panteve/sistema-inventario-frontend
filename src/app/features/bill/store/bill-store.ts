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
import { catchError, EMPTY, filter, finalize, pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import {
  CreateBillRequest,
  ProductOnBill,
  ProductSelected,
} from '../../../shared/interfaces/bill.interface';
import { CustomerStore } from './customer-store';
import { NgFastToastService } from 'ng-fast-toast';
import { CashRegisterStore } from '../../cash-register/store/cash-register-store';

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
    customerId: 0,
    paymentMethodId: 0,
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
    customerStore: inject(CustomerStore),
    cashRegisterStore: inject(CashRegisterStore),
    toastNotification: inject(NgFastToastService),
    router: inject(Router),
  })),
  withMethods(({ toastNotification, cashRegisterStore, ...store }) => ({
    _isValidForSubmit: () => {
      if (store.length() === 0) {
        toastNotification.error({
          title: 'Factura vacía',
          content: 'Agrega al menos un producto a la factura.',
          duration: 5,
        });
        patchState(store, { loading: false });
        return false;
      }
      if (store.bill().paymentMethodId === 0) {
        toastNotification.error({
          title: 'Método de pago no seleccionado',
          content: 'Selecciona un método de pago.',
          duration: 5,
        });
        patchState(store, { loading: false });
        return false;
      }
      return true;
    },
  })),
  withMethods(({ customerStore, billService, toastNotification, router, cashRegisterStore, ...store }) => ({
    createBill: rxMethod<void>(
      pipe(
        tap(() => {
          const customer = customerStore.customer();
          patchState(store, (state) => ({
            bill: {
              ...state.bill,
              customerId: customer ? customer.id : 0,
            },
            loading: true,
          }));
        }),
        filter(() => store._isValidForSubmit()),
        switchMap(() => {
          const cleanBill = {
            ...store.bill(),
            products: store.bill().products.map(({ name, ...rest }) => rest),
          };
          return billService.createBill(cleanBill).pipe(
            tap((billId) => {
              patchState(store, { loading: false });
              console.log('Factura creada con ID:', billId);
              cashRegisterStore.getCashRegisterSummary();
              //router.navigate([`/bill/${billId}`]);
            }),
          );
        }),
        finalize(() => patchState(store, { loading: false })),
        catchError((error) => {
          toastNotification.error({
            title: 'Error al crear la factura',
            content: 'Ocurrió un error al crear la factura. Inténtalo de nuevo.',
            duration: 5,
          });
          return EMPTY;
        }),
      ),
    ),

    cancelBill() {
      customerStore.clearCustomer();
      patchState(store, { bill: initialState.bill, loading: false });
    },
    setSelectedProduct(product: ProductSelected) {
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
    quitProduct(productId: number) {
      patchState(store, (state) => ({
        bill: {
          ...state.bill,
          products: state.bill.products.filter((p) => p.productId !== productId),
        },
      }));
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
