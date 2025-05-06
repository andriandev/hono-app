import type { ResJSONTypes } from '@helpers/types';

export function resJSON<T = any>({
  statusCode = 200,
  data,
  ...props
}: ResJSONTypes<T>): ResJSONTypes<T> {
  return {
    status: statusCode,
    ...props,
    ...(data !== undefined ? { data } : {}),
  };
}

export function filterStringAlias(input: string): string {
  const plusAtEnd = input.trim().endsWith('+');
  let sanitized = input
    .trim()
    .replace(/[^a-zA-Z0-9\s-_]/g, '') // Hapus karakter selain huruf, angka, spasi, -, _
    .replace(/\s+/g, '-') // Ganti spasi dengan -
    .replace(/-+/g, '-') // Gabungkan tanda - ganda
    .replace(/_+/g, '_') // Gabungkan tanda _ ganda
    .replace(/^-+|-+$/g, '') // Hapus - di awal/akhir
    .replace(/^_+|_+$/g, ''); // Hapus _ di awal/akhir

  return plusAtEnd ? sanitized + '+' : sanitized;
}

export function formatDateTime(datetimeStr: string): string {
  const timezone: string =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
  const date: Date = new Date(datetimeStr);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}
