import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cashier-dashboard.component',
  imports: [DecimalPipe],
  templateUrl: './cashier-dashboard.component.html',
})
export class CashierDashboardComponent {
  readonly now = signal(new Date());

  readonly shiftSummary = signal({
    employeeName: 'Juan Rodriguez',
    shiftSince: '08:00 AM',
    salesTotal: 842500,
    transactions: 12,
    averageTicket: 70208,
    cashInDrawer: 512000,
    initialCash: 200000,
    cardTotal: 330500,
    cardTransactions: 5,
    cashPercentage: 61,
    cardPercentage: 39,
  });

  readonly topProducts = signal([
    { name: 'Coca-Cola 350ml', quantity: 18, max: 100, percent: 82 },
    { name: 'Agua Cristal 600ml', quantity: 13, max: 100, percent: 64 },
    { name: 'Papas Margarita', quantity: 9, max: 100, percent: 48 },
    { name: 'Milo 200ml', quantity: 6, max: 100, percent: 32 },
    { name: 'Chocolatina Jet', quantity: 4, max: 100, percent: 22 },
  ]);

  readonly lastSales = signal([
    { id: '#0042', time: '4 min', amount: 38000, method: 'Efectivo', methodType: 'success' as const },
    { id: '#0041', time: '18 min', amount: 112500, method: 'Tarjeta', methodType: 'info' as const },
    { id: '#0040', time: '35 min', amount: 54000, method: 'Efectivo', methodType: 'success' as const },
  ]);

  readonly assistantMessages = signal([
    { text: '¿Cómo voy vs la semana pasada?', active: false },
    { text: '¿Qué productos tienen stock bajo?', active: false },
    { text: '¿Cuál es mi producto más vendido?', active: false },
  ]);
}
