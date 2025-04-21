import { describe, it, expect, beforeEach } from 'bun:test';
import { app } from '../index';
import { cache } from '@app/config/cache';

describe('GET /:alias', () => {
  beforeEach(() => {
    cache.flushAll();
  });

  it('should return 404 if alias not found in API', async () => {
    const res = await app.request('/alias-not-exist');
    const html = await res.text();

    expect(res.status).toBe(404);
    expect(html).toContain('Not Found'); // atau cek ciri khas NotFoundPage
  });

  it('should render shortlink page and cache if alias valid', async () => {
    // Pastikan alias `testing` tersedia di backend dan mengarah ke URL nyata
    const res = await app.request('/testing');
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain('https://'); // atau konten khas ShortlinkPage
    expect(cache.get('alias:testing')).toBeDefined();
  });

  it('should use cache if alias already cached', async () => {
    cache.set('alias:testing-cache', 'https://cached.com');

    const res = await app.request('/testing-cache');
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain('https://cached.com');
  });
});
