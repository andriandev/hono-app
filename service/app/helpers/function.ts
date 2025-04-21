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
  return input
    .trim()
    .replace(/[^a-zA-Z0-9\s-_]/g, '') // Hapus karakter selain huruf, angka, spasi, tanda -, dan tanda _
    .replace(/\s+/g, '-') // Ganti spasi dengan -
    .replace(/-+/g, '-') // Gabungkan tanda - ganda
    .replace(/_+/g, '_') // Gabungkan tanda _ ganda
    .replace(/^-+|-+$/g, '') // Hapus - di awal/akhir
    .replace(/^_+|_+$/g, ''); // Hapus _ di awal/akhir
}
