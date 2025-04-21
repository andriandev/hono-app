import { describe, it, expect, beforeEach } from 'bun:test';
import { app } from '../index';
import { cache } from '@app/config/cache';

describe('GET /cache/flush', () => {
  beforeEach(() => {
    cache.flushAll();
  });

  it('should deny access with wrong key', async () => {
    const res = await app.request('/cache/flush?key=wrong-key');
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.status).toBe(401);
    expect(data.message).toBe('Access denied, wrong key');
  });

  it('should flush cache with correct key', async () => {
    cache.set('foo', 'bar');
    expect(cache.get('foo')).toBe('bar');

    const res = await app.request(
      `/cache/flush?key=${process.env.APP_SECRET_KEY}`
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe(200);
    expect(data.message).toBe('Successfully cleared all cache');

    expect(cache.get('foo')).toBeUndefined();
  });
});
