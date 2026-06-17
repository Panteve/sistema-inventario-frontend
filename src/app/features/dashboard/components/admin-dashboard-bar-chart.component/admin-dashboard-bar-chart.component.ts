import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BarChartData } from '../../../../shared/interfaces/dashboard.interface';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';
import { ChartOptions } from '../../types/chart-options.type';
import {
  dashboardChartAppearance,
  dashboardChartApexTheme,
  dashboardChartLegend,
  dashboardChartToolbar,
  dashboardChartTooltip,
} from '../../utils/dashboard-chart-theme';

@Component({
  selector: 'app-admin-dashboard-bar-chart',
  imports: [NgApexchartsModule],
  providers: [CopPipe],
  templateUrl: './admin-dashboard-bar-chart.component.html',
  styleUrl: '../../styles/dashboard-chart.styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardBarChartComponent {
  barChartData = input.required<BarChartData>();
  mode = input<'office' | 'payment'>('office');

  #copPipe = inject(CopPipe);

  categories: string[] = [];
  currentSeries: number[] = [];
  previousSeries: number[] = [];

  constructor() {
    effect(() => {
      const ids: number[] = [];
      const categories: string[] = [];
      const seen = new Set<number>();

      const addEntity = (id: number, name: string) => {
        if (seen.has(id)) return;
        seen.add(id);
        ids.push(id);
        categories.push(name);
      };

      this.barChartData().currentData.forEach((item) => addEntity(item.id, item.name));
      this.barChartData().previousData.forEach((item) => addEntity(item.id, item.name));

      const currentByOffice = new Map(
        this.barChartData().currentData.map((item) => [item.id, item.total]),
      );
      const previousByOffice = new Map(
        this.barChartData().previousData.map((item) => [item.id, item.total]),
      );

      const currentSeries = ids.map((id) => currentByOffice.get(id) ?? 0);
      const previousSeries = ids.map((id) => previousByOffice.get(id) ?? 0);

      this.currentSeries = currentSeries;
      this.previousSeries = previousSeries;
      this.categories = categories;
    });
  }

  public get chartOptions(): Partial<ChartOptions> {
    const isOffice = this.mode() === 'office';
    const filename = isOffice ? 'ventas-por-sucursal' : 'ventas-por-metodo-de-pago';
    const categoryLabel = isOffice ? 'Sucursal' : 'Método de pago';

    return {
      series: [
        {
          name: 'Periodo actual',
          data: this.currentSeries,
        },
        {
          name: 'Periodo anterior',
          data: this.previousSeries,
        },
      ],
      theme: dashboardChartApexTheme(),
      chart: {
        type: 'bar',
        height: 320,
        width: '100%',
        ...dashboardChartAppearance(),
        toolbar: {
          ...dashboardChartToolbar(filename),
          export: {
            csv: {
              filename,
              columnDelimiter: ',',
              headerCategory: categoryLabel,
              headerValue: 'Ventas',
            },
            png: { filename },
            svg: { filename },
          },
        },
        selection: {
          enabled: false,
        },
      },
      colors: ['var(--color-primary)', 'var(--color-secondary)'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '48%',
          borderRadius: 8,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['var(--color-base-100)'],
      },
      xaxis: {
        categories: this.categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: 'var(--color-base-content)',
            fontSize: '12px',
            fontFamily: 'inherit',
          },
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
          right: 8,
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
      fill: {
        opacity: [1, 0.55],
        type: 'solid',
      },
      tooltip: {
        ...dashboardChartTooltip(),
        shared: true,
        intersect: false,
        y: {
          formatter: (value) => this.#copPipe.transform(value),
        },
      },
      legend: dashboardChartLegend('bottom'),
      states: {
        hover: {
          filter: {
            type: 'darken',
          },
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'darken',
          },
        },
      },
    };
  }
}
