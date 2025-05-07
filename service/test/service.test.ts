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
    // Pastikan alias `Ql9y` tersedia di backend dan mengarah ke URL nyata
    const res = await app.request('/Ql9y');

    expect(res.status).toBe(302);
  });

  it('should use cache if alias already cached', async () => {
    cache.set('alias:testing-cache-app', { destination: 'https://google.com' });

    const res = await app.request('/testing-cache-app');

    expect(res.status).toBe(302);
  });
});

describe('GET /post/:hash_id', () => {
  it('should render a published post page from external server', async () => {
    const hashId = 'xvVw';

    const response = await app.request(`/post/${hashId}`);

    expect(response.status).toBe(200);
  });

  it('should return 404 for unpublished', async () => {
    const notPublish = 'Mkag';

    const response = await app.request(`/post/${notPublish}`);

    expect(response.status).toBe(404);
  });

  it('should return 404 for not exist', async () => {
    const notExist = 'Mkag';

    const response = await app.request(`/post/${notExist}`);

    expect(response.status).toBe(404);
  });
});
