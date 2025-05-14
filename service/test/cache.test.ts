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

describe('GET /cache/:key', () => {
  beforeEach(() => {
    cache.flushAll();
  });

  it('should deny access with wrong key', async () => {
    const res = await app.request('/cache/test:12345?key=wrong-key');
    const data = await res.json();

    expect(res.status).toBe(401);

    expect(data.status).toBe(401);
    expect(data.message).toBe('Access denied, wrong key or no auth');
  });

  it('should delete cache with correct key', async () => {
    cache.set('test:123', 'value');
    expect(cache.get('test:123')).toBe('value');

    const res = await app.request(
      `/cache/test:123?key=${process.env.APP_SECRET_KEY}`
    );
    const data = await res.json();

    expect(res.status).toBe(200);

    expect(data.status).toBe(200);
    expect(data.message).toBe('Successfully delete cache test:123');

    expect(cache.get('test:123')).toBeUndefined();
  });

  it('should delete cache with auth header', async () => {
    cache.set('test:123auth', 'value');
    expect(cache.get('test:123auth')).toBe('value');

    const res = await app.request(`/cache/test:123auth`, {
      headers: {
        Authorization: `Bearer 123`,
      },
    });
    const data = await res.json();

    expect(res.status).toBe(200);

    expect(data.status).toBe(200);
    expect(data.message).toBe('Successfully delete cache test:123auth');

    expect(cache.get('test:123auth')).toBeUndefined();
  });

  it('should failed delete cache not exist', async () => {
    const res = await app.request(
      `/cache/test:123456?key=${process.env.APP_SECRET_KEY}`
    );
    const data = await res.json();

    expect(res.status).toBe(200);

    expect(data.status).toBe(200);
    expect(data.message).toBe('No cache test:123456');
  });
});
