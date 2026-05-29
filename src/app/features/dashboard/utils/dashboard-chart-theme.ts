import type { ApexChart, ApexLegend, ApexTheme, ApexTooltip } from 'ng-apexcharts';
import { THEMES } from '../../../constants/theme.constants';

/** Semantic DaisyUI / Tailwind palette for multi-series charts. */
export const DASHBOARD_CHART_COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent)',
  'var(--color-info)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
] as const;

export const dashboardChartAppearance = (): Pick<ApexChart, 'background' | 'foreColor' | 'fontFamily'> => ({
  background: 'transparent',
  foreColor: 'var(--color-base-content)',
  fontFamily: 'inherit',
});

export const dashboardChartLegend = (
  position: ApexLegend['position'] = 'bottom',
): ApexLegend => ({
  position,
  horizontalAlign: position === 'right' ? 'center' : 'center',
  fontSize: '12px',
  fontFamily: 'inherit',
  offsetY: position === 'bottom' ? 4 : 0,
  itemMargin: {
    horizontal: 10,
    vertical: 4,
  },
  labels: {
    colors: 'var(--color-base-content)',
  },
  markers: {
    size: 10,
    strokeWidth: 0,
    offsetX: -2,
  },
});

export const dashboardChartApexTheme = (): ApexTheme => ({
  mode: dashboardChartApexThemeMode(),
});

export function dashboardChartApexThemeMode(): 'light' | 'dark' {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === THEMES.LIGHT ? 'light' : 'dark';
}

export const dashboardChartTooltip = (): ApexTooltip => ({
  theme: 'light',
  style: {
    fontSize: '12px',
    fontFamily: 'inherit',
  },
  
  cssClass: 'dashboard-chart-tooltip',
});

export const dashboardChartToolbar = (filename: string): ApexChart['toolbar'] => ({
  show: true,
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
      filename,
      columnDelimiter: ',',
    },
    png: { filename },
    svg: { filename },
  },
});

export function filterNonZeroChartSlices(
  labels: string[],
  series: number[],
): { labels: string[]; series: number[] } {
  const slices = labels
    .map((label, index) => ({ label, value: series[index] ?? 0 }))
    .filter((slice) => slice.value > 0);

  return {
    labels: slices.map((slice) => slice.label),
    series: slices.map((slice) => slice.value),
  };
}
