import type { ZodIssue } from 'zod';
import type { ResJSONTypes } from '@helpers/types';
import { hashIdPost } from '@helpers/hashids';

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

export function formatZodErrors(errors: ZodIssue[]): Record<string, string> {
  const result: Record<string, string> = {};

  errors.forEach((error) => {
    const field = String(error.path[0]);
    result[field] = error.message;
  });

  return result;
}

export function customJwtErrorMessage(
  err: { name?: string } | null | undefined
): string {
  switch (err?.name) {
    case 'JwtAlgorithmNotImplemented':
      return 'JWT algorithm is not implemented';
    case 'JwtTokenInvalid':
      return 'Invalid JWT token';
    case 'JwtTokenNotBefore':
      return 'JWT token is not active yet (nbf claim)';
    case 'JwtTokenExpired':
      return 'JWT token has expired';
    case 'JwtTokenIssuedAt':
      return 'Invalid issued-at (iat) claim in JWT token';
    case 'JwtTokenSignatureMismatched':
      return 'JWT token signature does not match';
    default:
      return 'Invalid token';
  }
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

export function containsNonAlphanumeric(str: string): boolean {
  return /[^a-zA-Z0-9]/.test(str);
}

export function orderResponsePost(dataPost: any) {
  const { id, ...rest } = dataPost;
  return {
    id,
    hash_id: hashIdPost.encode(id),
    ...rest,
  };
}
