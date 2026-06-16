import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardCharts, PieChartData } from '../../../../shared/interfaces/dashboard.interfacce';
import { ChartOptions } from '../../types/chart-options.type';
import {
  DASHBOARD_CHART_COLORS,
  dashboardChartAppearance,
  dashboardChartApexTheme,
  dashboardChartLegend,
  dashboardChartToolbar,
  dashboardChartTooltip,
  filterNonZeroChartSlices,
} from '../../utils/dashboard-chart-theme';

@Component({
  selector: 'app-admin-dashboard-pie-chart',
  imports: [NgApexchartsModule],
  templateUrl: './admin-dashboard-pie-chart.component.html',
  styleUrl: '../../styles/dashboard-chart.styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPieChartComponent {
  dashboardCharts = input.required<PieChartData[]>();

  readonly #chartData = computed(() =>
    this.#normalizePaymentMethodDistribution(this.dashboardCharts()),
  );

  readonly hasData = computed(() => this.#chartData().series.length > 0);

  public get chartOptions(): Partial<ChartOptions> {
    const { labels, series } = this.#chartData();

    return {
      series,
      labels,
      colors: [...DASHBOARD_CHART_COLORS],
      theme: dashboardChartApexTheme(),
      chart: {
        type: 'pie',
        width: '100%',
        height: 300,
        ...dashboardChartAppearance(),
        toolbar: {
          ...dashboardChartToolbar('ventas-por-metodo-de-pago'),
          offsetX: -120,
          export: {
            csv: {
              filename: 'ventas-por-metodo-de-pago',
              columnDelimiter: ',',
              headerCategory: 'Metodo de Pago',
              headerValue: 'Transacciones',
            },
            png: { filename: 'ventas-por-metodo-de-pago' },
            svg: { filename: 'ventas-por-metodo-de-pago' },
          },
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['var(--color-base-100)'],
      },
      plotOptions: {
        pie: {
          expandOnClick: true,
          dataLabels: {
            offset: -4,
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (value) => `${Number(value).toFixed(1)}%`,
        style: {
          fontSize: '13px',
          fontWeight: '700',
          fontFamily: 'inherit',
          colors: ['#fff'],
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 3,
          opacity: 0.4,
        },
      },
      legend: dashboardChartLegend('right'),
      states: {
        hover: {
          filter: {
            type: 'lighten',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        ...dashboardChartTooltip(),
        y: {
          formatter: (value) => `${value} transacciones`,
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 280,
            },
            legend: {
              position: 'bottom',
              horizontalAlign: 'center',
            },
          },
        },
      ],
    };
  }

  #normalizePaymentMethodDistribution(charts: PieChartData[]): {
    labels: string[];
    series: number[];
  } {
    const labels = charts.map((item) => item.name);
    const series = charts.map((item) => item.count);

    return filterNonZeroChartSlices(labels, series);
  }
}
