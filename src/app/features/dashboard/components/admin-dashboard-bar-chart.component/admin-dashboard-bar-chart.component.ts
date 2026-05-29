import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DashboardCharts } from '../../../../shared/interfaces/dashboard.interfacce';
import { CopPipe } from '../../../../shared/pipes/cop.pipes';

import { ChartOptions } from '../../types/chart-options.type';
import { NgApexchartsModule } from 'ng-apexcharts';
@Component({
  selector: 'app-admin-dashboard-bar-chart',
  imports: [NgApexchartsModule],
  providers: [CopPipe],
  templateUrl: './admin-dashboard-bar-chart.component.html',
  styleUrl: './admin-dashboard-bar-chart.component.css',
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
      chart: {
        type: 'bar',
        height: 320,
        background: 'transparent',
        foreColor: 'var(--color-base-content)',
        toolbar: {
          show: true,
          offsetY: -6,
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
              filename: 'ventas-por-sucursal',
              columnDelimiter: ',',
              headerCategory: 'Sucursal',
              headerValue: 'Ventas',
            },
            png: {
              filename: 'ventas-por-sucursal',
            },
            svg: {
              filename: 'ventas-por-sucursal',
            },
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
          columnWidth: '55%',
          borderRadius: 6,
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
          color: 'var(--color-base-300)',
        },
        axisTicks: {
          color: 'var(--color-base-300)',
        },
        labels: {
          style: {
            colors: 'var(--color-base-content)',
          },
        },
      },

      yaxis: {
        labels: {
          style: {
            colors: 'var(--color-base-content)',
          },
          formatter: (value) => this.#copPipe.transform(value),
        },
      },
      grid: {
        borderColor: 'var(--color-base-content)',
        strokeDashArray: 4,
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
        opacity: 1,
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value) => this.#copPipe.transform(value),
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        offsetY: 6,
        itemMargin: {
          horizontal: 12,
          vertical: 6,
        },
        labels: {
          colors: 'var(--color-base-content)',
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
