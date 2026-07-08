import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AreaChartData } from '../../../../shared/interfaces/dashboard.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { ChartOptions } from '../../types/chart-options.type';
import {
  dashboardChartAppearance,
  dashboardChartApexTheme,
  dashboardChartToolbar,
  dashboardChartTooltip,
} from '../../utils/dashboard-chart-theme';

@Component({
  selector: 'app-admin-dashboard-area-chart',
  imports: [NgApexchartsModule],
  providers: [CopPipe],
  templateUrl: './admin-dashboard-area-chart.component.html',
  styleUrl: '../../styles/dashboard-chart.styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardAreaChartComponent {
  dashboardCharts = input.required<AreaChartData[]>();

  #copPipe = inject(CopPipe);

  public get chartOptions(): Partial<ChartOptions> {
    return this.#buildSalesByHourChartOptions(this.dashboardCharts());
  }

  #buildSalesByHourChartOptions(charts: AreaChartData[]): Partial<ChartOptions> {
    const { categories, totals, counts } = this.#buildSalesByHourSeries(charts);

    return {
      series: [
        {
          name: 'Ventas',
          data: totals,
        },
      ],
      theme: dashboardChartApexTheme(),
      chart: {
        type: 'area',
        height: 280,
        width: '100%',
        zoom: {
          enabled: false,
        },
        ...dashboardChartAppearance(),
        toolbar: {
          ...dashboardChartToolbar('ventas-por-hora'),
          export: {
            csv: {
              filename: 'ventas-por-hora',
              columnDelimiter: ',',
              headerCategory: 'Hora',
              headerValue: 'Ventas',
            },
            png: { filename: 'ventas-por-hora' },
            svg: { filename: 'ventas-por-hora' },
          },
        },
      },
      colors: ['var(--color-primary)'],
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['var(--color-primary)'],
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.42,
          opacityTo: 0.04,
          stops: [0, 92, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
        hover: {
          size: 5,
          sizeOffset: 2,
        },
      },
      xaxis: {
        categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          rotate: -45,
          rotateAlways: false,
          hideOverlappingLabels: true,
          style: {
            colors: 'var(--color-base-content)',
            fontSize: '11px',
            fontFamily: 'inherit',
          },
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)',
            fontSize: '11px',
            fontFamily: 'inherit',
          },
          formatter: (value) => this.#copPipe.transform(value),
        },
      },
      grid: {
        borderColor: 'color-mix(in oklab, var(--color-base-content) 10%, transparent)',
        strokeDashArray: 4,
        padding: {
          left: 8,
          right: 12,
        },
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      tooltip: {
        ...dashboardChartTooltip(),
        intersect: false,
        shared: false,
        x: {
          show: true,
        },
        y: {
          formatter: (value, opts) => {
            const index = opts?.dataPointIndex ?? 0;
            const count = counts[index] ?? 0;
            return `${this.#copPipe.transform(value)} · ${count} transacciones`;
          },
        },
      },
      legend: {
        show: false,
      },
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
    };
  }

  #buildSalesByHourSeries(charts: AreaChartData[]): {
    categories: string[];
    totals: number[];
    counts: number[];
  } {
    const byHour = new Map(charts.map((item) => [item.hour, item]));
    const categories: string[] = [];
    const totals: number[] = [];
    const counts: number[] = [];

    for (let hour = 0; hour < 24; hour++) {
      categories.push(`${String(hour).padStart(2, '0')}:00`);
      const item = byHour.get(hour);
      totals.push(item?.total ?? 0);
      counts.push(item?.count ?? 0);
    }

    return { categories, totals, counts };
  }
}
