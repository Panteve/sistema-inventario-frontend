export const maxRangeMonths = 3;

export function isIsoDate(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '' ) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) || 0 ? parsed : undefined;
}

export function parseStatus(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;

  return undefined;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toIsoDateUtc(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function subtractMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() - months);
  return copy;
}

function addMonthsIso(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  date.setMonth(date.getMonth() + months);

  return toIsoDate(date);
}

export function normalizeDateRange<T extends { startDate: string; endDate: string }>(
  params: T,
  todayIso: string,
  isAdmin: boolean,
): T {
  let { startDate, endDate } = params;
  const maxRangeMonths: number = 3;

  if (startDate > todayIso) {
    startDate = todayIso;
  }

  const maxEndDate = isAdmin ? todayIso : addMonthsIso(startDate, maxRangeMonths);
  const cappedMaxEndDate = maxEndDate > todayIso ? todayIso : maxEndDate;

  if (endDate < startDate) {
    endDate = startDate;
  }

  if (endDate > cappedMaxEndDate) {
    endDate = cappedMaxEndDate;
  }

  return {
    ...params,
    startDate,
    endDate,
  };
}

export function coerceIsoDate(value: unknown): string | null {
  if (value instanceof Date) {
    return toIsoDateUtc(value);
  }

  if (typeof value === 'string' && isIsoDate(value)) {
    return value;
  }

  return null;
}
