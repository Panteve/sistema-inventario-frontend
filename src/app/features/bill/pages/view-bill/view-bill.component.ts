import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { BillService } from '../../services/bill.service';
import { BillResponse } from '../../../../shared/interfaces/bill.interface';
import { finalize } from 'rxjs';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthStore } from '../../../../core/store/auth-store';
import { ToastService } from '../../../../shared/services/toast.service';
import { ModalComponent } from '../../../../shared/components/modal.component/modal.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

type BreadcrumbItem = { label: string; path: string | null };

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-view-bill.component',
  imports: [CopPipe, RouterLink, DatePipe, ModalComponent, ReactiveFormsModule],
  templateUrl: './view-bill.component.html',
})
export class ViewBillComponent implements OnInit {
  #router = inject(Router);
  #billService = inject(BillService);
  #authStore = inject(AuthStore);
  #toastService = inject(ToastService);

  billIdParams = input.required<string>({ alias: 'billId' });
  readonly from = input<string>();
  readonly fromId = input<string>();

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];
    const fromRoute = this.from();

    switch (fromRoute) {
      case '/view-cash-registers/list': {
        items.push({ label: 'Historial de cajas', path: '/view-cash-registers/list' });
        const crId = this.fromId();
        if (crId) {
          items.push({
            label: `Caja #${crId}`,
            path: `/view-cash-registers/cash-register/${crId}`,
          });
        }
        break;
      }
      case '/view-bills/list': {
        items.push({ label: 'Historial de ventas', path: '/view-bills/list' });
        break;
      }
      case '/dashboard': {
        items.push({ label: 'Dashboard', path: '/dashboard' });
        break;
      }
      default: {
        items.push({ label: 'Historial de ventas', path: '/view-bills/list' });
        break;
      }
    }

    items.push({ label: `Factura #${this.bill().id || this.billIdParams()}`, path: null });
    return items;
  });
  loading = signal<boolean>(true);
  bill = signal<BillResponse>({
    id: 0,
    status: true,
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    amountReceived: 0,
    difference: 0,
    createdAt: '',
    products: [],
    customer: null,
    cashRegister: {
      id: 0,
      office: {
        name: '',
      },
    },
    employee: {
      id: 0,
      name: '',
      document: '',
      phone: '',
    },
    payments: [],
  });

  showCancelModal = signal(false);
  cancelReason = new FormControl('');

  canCancel = computed(() => {
    const b = this.bill();
    const employee = this.#authStore.employee();
    if (!b.id || !b.status || !employee) return false;
    return b.cashRegister.id === employee.cashRegister;
  });

  constructor() {
    const navBill = this.#router.currentNavigation()?.extras.state?.['bill'] as
      | BillResponse
      | undefined;

    if (navBill) {
      this.bill.set(navBill);
      this.loading.set(false);
    }
  }

  ngOnInit(): void {
    if (this.bill().id !== 0) {
      this.loading.set(false);
      return;
    }
    this.#billService
      .getBillById(Number(this.billIdParams()))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (bill) => {
          this.bill.set(bill);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  openCancelModal() {
    this.cancelReason.setValue('');
    this.showCancelModal.set(true);
  }

  closeCancelModal() {
    this.showCancelModal.set(false);
  }

  confirmCancel() {
    const b = this.bill();

    if (!b.id || !this.cancelReason.value) return;
    const cancelReason = this.cancelReason.value.trim();
    this.#billService.cancelBill({ id: b.id, cancelReason }).subscribe({
      next: () => {
        this.bill.update((bill) => ({
          ...bill,
          status: false,
          cancelReason,
          cancelAt: new Date().toISOString(),
        }));
        // A decision de la persona actualizar el inventario a mano
        this.showCancelModal.set(false);
        this.#toastService.show({
          title: 'Factura anulada',
          content: 'Factura anulada correctamente.',
          type: 'success',
        });
      },
      error: () => {
        this.#toastService.show({
          content: 'Error al anular la factura. Intenta de nuevo.',
          type: 'error',
        });
      },
    });
  }

  viewCashRegister(cashRegisterId: number) {
    this.#router.navigate(['/view-cash-registers/cash-register', cashRegisterId], {
      queryParams: { from: '/view-bills/bill', fromId: this.billIdParams() },
    });
  }
}
