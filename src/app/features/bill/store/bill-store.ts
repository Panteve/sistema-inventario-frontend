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
import { ToastService } from '../../../shared/services/toast.service';

type BillState = {
  bill: CreateBillRequest;
  loading: boolean;
};

const initialState: BillState = {
  bill: {
    customerId: 0,
    paymentMethodId: 0,
    amountReceived: 0,
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
    length: computed(() => bill().products.length),
  })),
  withLinkedState(({ subtotal }) => ({
    iva: () => subtotal() * 0.19,
    total: () => subtotal() * 1.19,
  })),
  withProps(() => ({
    billService: inject(BillService),
    customerStore: inject(CustomerStore),
    toastService: inject(ToastService),
    router: inject(Router),
  })),
  withMethods(({ toastService, ...store }) => ({
    _isValidForSubmit: () => {
      if (store.length() === 0) {
        toastService.show({
          title: 'Factura vacía',
          content: 'Agrega productos a la factura.',
          type: 'error',
        });

        patchState(store, { loading: false });
        return false;
      }
      if (store.bill().paymentMethodId === 0) {
        toastService.show({
          title: 'Método de pago no seleccionado',
          content: 'Selecciona un método de pago.',
          type: 'error',
        });
        patchState(store, { loading: false });
        return false;
      }
      return true;
    },
  })),
  withMethods(({ customerStore, billService, toastService, router, ...store }) => ({
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
              router.navigate(['/view-bills/bill', billId]);
            }),
            finalize(() => patchState(store, { loading: false })),
            catchError((error) => {
              toastService.show({
                title: 'Error al crear la factura',
                content: 'Ocurrió un error al crear la factura. Inténtalo de nuevo.',
                type: 'error',
              });
              return EMPTY;
            }),
          );
        }),
      ),
    ),

    cancelBill() {
      customerStore.clearCustomer();
      patchState(store, { bill: initialState.bill, loading: false });
    },
    addProduct(product: ProductSelected) {
      const productTo: ProductOnBill = {
        productId: product.id,
        name: product.name,
        priceUnique: product.priceSelected,
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
      toastService.show({
        title: 'Producto agregado',
        content: `Se agregó ${productTo.name} a la factura.`,
        type: 'success',
      });
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
