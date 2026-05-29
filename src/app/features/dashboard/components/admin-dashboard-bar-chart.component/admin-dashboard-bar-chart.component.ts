import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardCharts } from '../../../../shared/interfaces/dashboard.interfacce';
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
  dashboardCharts = input.required<DashboardCharts>();

  #copPipe = inject(CopPipe);

  public get chartOptions(): Partial<ChartOptions> {
    return this.#buildOfficeSalesChartOptions(this.dashboardCharts());
  }

  #buildOfficeSalesChartOptions(charts: DashboardCharts): Partial<ChartOptions> {
    const { categories, currentSeries, previousSeries } = this.#buildOfficeSalesComparison(charts);

    return {
      series: [
        {
          name: 'Periodo actual',
          data: currentSeries,
        },
        {
          name: 'Periodo anterior',
          data: previousSeries,
        },
      ],
      theme: dashboardChartApexTheme(),
      chart: {
        type: 'bar',
        height: 320,
        width: '100%',
        ...dashboardChartAppearance(),
        toolbar: {
          ...dashboardChartToolbar('ventas-por-sucursal'),
          export: {
            csv: {
              filename: 'ventas-por-sucursal',
              columnDelimiter: ',',
              headerCategory: 'Sucursal',
              headerValue: 'Ventas',
            },
            png: { filename: 'ventas-por-sucursal' },
            svg: { filename: 'ventas-por-sucursal' },
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
        categories,
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

  #buildOfficeSalesComparison(charts: DashboardCharts): {
    categories: string[];
    currentSeries: number[];
    previousSeries: number[];
  } {
    const officeIds: number[] = [];
    const categories: string[] = [];
    const seen = new Set<number>();

    const addOffice = (officeId: number, officeName: string) => {
      if (seen.has(officeId)) return;
      seen.add(officeId);
      officeIds.push(officeId);
      categories.push(officeName);
    };

    charts.currentOfficeSales.forEach((item) => addOffice(item.officeId, item.officeName));
    charts.previousOfficeSales.forEach((item) => addOffice(item.officeId, item.officeName));

    const currentByOffice = new Map(
      charts.currentOfficeSales.map((item) => [item.officeId, item.total]),
    );
    const previousByOffice = new Map(
      charts.previousOfficeSales.map((item) => [item.officeId, item.total]),
    );

    const currentSeries = officeIds.map((officeId) => currentByOffice.get(officeId) ?? 0);
    const previousSeries = officeIds.map((officeId) => previousByOffice.get(officeId) ?? 0);

    return { categories, currentSeries, previousSeries };
  }
}
