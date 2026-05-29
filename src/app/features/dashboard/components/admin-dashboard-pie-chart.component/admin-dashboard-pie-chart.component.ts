import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardCharts } from '../../../../shared/interfaces/dashboard.interfacce';
import { ChartOptions } from '../../types/chart-options.type';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-admin-dashboard-pie-chart',
  imports: [NgApexchartsModule],
  templateUrl: './admin-dashboard-pie-chart.component.html',
  styleUrl: '../admin-dashboard-bar-chart.component/admin-dashboard-bar-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPieChartComponent {
  dashboardCharts = input.required<DashboardCharts>();

  public get chartOptions(): Partial<ChartOptions> {
    const { labels, series } = this.#normalizePaymentMethodDistribution(this.dashboardCharts());

    return {
      series,
      labels,
      chart: {
        width: 380,
        type: 'pie',
        background: 'transparent',
        foreColor: 'var(--color-base-content)',
        toolbar: {
          show: true,
          offsetY: 0,
          offsetX: -100,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
          export: {
            csv: {
              filename: 'ventas-por-metodo-de-pago',
              columnDelimiter: ',',
              headerCategory: 'Metodo de Pago',
              headerValue: 'Ventas',
            },
            png: {
              filename: 'ventas-por-metodo-de-pago',
            },
            svg: {
              filename: 'ventas-por-metodo-de-pago',
            },
          },
        },
      },
      stroke: {
        show: false,
        width: 0,
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
        },
      },
      fill: {
        opacity: 1,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }

  #normalizePaymentMethodDistribution(charts: DashboardCharts): {
    labels: string[];
    series: number[];
  } {
    const labels = charts.paymentMethodDistribution.map((item) => item.paymentMethodName);
    const series = charts.paymentMethodDistribution.map((item) => item.count);

    return { labels, series };
  }
}
