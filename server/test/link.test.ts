import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '../index';
import { sign } from 'hono/jwt';
import { prismaClient } from '@app/config/database';
import { APP_HASH_ID, APP_JWT_SECRET } from '@app/config/setting';

describe('GET /link/all', () => {
  let userId = Math.floor(Math.random() * 1000000);
  const testUser = {
    username: 'testuser_links',
    password: 'password123',
    id: userId,
  };
  let token: string;

  beforeAll(async () => {
    await prismaClient.user.create({
      data: {
        id: userId,
      },
    });

    await prismaClient.link.createMany({
      data: [
        { user_id: testUser.id, destination: 'https://example.com/1' },
        { user_id: testUser.id, destination: 'https://example.com/2' },
      ],
    });

    token = await sign(
      {
        id: testUser.id,
        username: testUser.username,
        role: 'member',
        app_id: APP_HASH_ID,
        is_active: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      APP_JWT_SECRET,
      'HS256'
    );
  });

  afterAll(async () => {
    await prismaClient.user.delete({
      where: {
        id: userId,
      },
    });
  });

  it('should return user links with pagination', async () => {
    const res = await app.request('/link/all', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.data.links.length).toBe(2);
    expect(data.data.paging.total_links).toBe(2);
  });

  it('should respect query params', async () => {
    const res = await app.request('/link/all?limit=1&order_by=created_at', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.data.links.length).toBe(1);
  });

  it('should return 401 without token', async () => {
    const res = await app.request('/link/all');

    expect(res.status).toBe(401);
  });

  it('should validate query params', async () => {
    // Test valid params
    const validRes = await app.request(
      '/link/all?limit=5&offset=0&order_by=view&order=asc',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect(validRes.status).toBe(200);

    // Test invalid limit type
    const invalidLimit = await app.request('/link/all?limit=invalid', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(invalidLimit.status).toBe(400);

    // Test invalid order_by
    const invalidOrder = await app.request('/link/all?order_by=invalid', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(invalidOrder.status).toBe(400);
  });
});

describe('GET /link/:alias', () => {
  const alias = 'test-alias-getlink';
  const destination = 'https://example.com';
  let userId = Math.floor(Math.random() * 1000000);

  beforeAll(async () => {
    await prismaClient.user.create({
      data: {
        id: userId,
      },
    });

    await prismaClient.link.create({
      data: {
        alias,
        destination,
        user_id: userId,
      },
    });
  });

  afterAll(async () => {
    await prismaClient.user.delete({
      where: {
        id: userId,
      },
    });
  });

  it('should return link data by alias', async () => {
    const res = await app.request(`/link/${alias}`, {
      method: 'GET',
    });

    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result?.data?.alias).toBe(alias);
    expect(result?.data?.destination).toBe(destination);
  });

  it('should return 400 if alias not found', async () => {
    const res = await app.request('/link/nonexistent-alias', {
      method: 'GET',
    });

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result?.message).toBe('Shortlink not found');
  });
});

describe('POST /link', () => {
  const username = 'user_test_link_create';
  let token: string;
  let userId: number;

  beforeAll(async () => {
    userId = Math.floor(Math.random() * 1000000);

    await prismaClient.user.create({
      data: {
        id: userId,
      },
    });

    token = await sign(
      {
        id: userId,
        username,
        role: 'member',
        app_id: APP_HASH_ID,
        is_active: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      APP_JWT_SECRET,
      'HS256'
    );
  });

  afterAll(async () => {
    await prismaClient.user.delete({
      where: {
        id: userId,
      },
    });
  });

  it('should create link successfully', async () => {
    const destination = 'https://example-test-create.com';
    const res = await app.request('/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination,
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result?.data?.destination).toBe(destination);
    expect(result?.data?.alias).toBeDefined();
  });

  it('should fail if alias already exists', async () => {
    const alias = 'alias-test-link-create';

    await prismaClient.link.create({
      data: {
        alias,
        destination: 'https://example.com',
        user_id: userId,
      },
    });

    const res = await app.request('/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alias,
        destination: 'https://example.com',
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result?.message).toBe('Alias is already exist');
  });

  it('should fail if no destination provided', async () => {
    const res = await app.request('/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: '',
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result?.message?.destination).toBe('Destination must be valid url');
  });
});

describe('PUT /link/:alias', () => {
  const username = 'user_test_link_update';
  let token: string;
  let userId: number;
  let alias: string;

  beforeAll(async () => {
    userId = Math.floor(Math.random() * 1000000);
    alias = 'alias-test-update';

    await prismaClient.user.create({
      data: {
        id: userId,
      },
    });

    await prismaClient.link.create({
      data: {
        user_id: userId,
        alias,
        destination: 'https://example.com',
      },
    });

    token = await sign(
      {
        id: userId,
        username,
        role: 'member',
        app_id: APP_HASH_ID,
        is_active: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      APP_JWT_SECRET,
      'HS256'
    );
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: {
        id: {
          in: [userId, userId + 1],
        },
      },
    });
  });

  it('should update link successfully', async () => {
    const res = await app.request(`/link/${alias}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'https://updated.com',
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result?.data?.destination).toBe('https://updated.com');
  });

  it('should return 400 if alias does not exist', async () => {
    const res = await app.request('/link/alias-not-exist', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'https://new.com',
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result?.message).toBe('Shortlink not found');
  });

  it('should return 403 if user does not own the link', async () => {
    const otherUserId = userId + 1;
    const otherAlias = `alias-unauthorized-${Math.random()
      .toString(36)
      .substring(7)}`;

    await prismaClient.user.create({
      data: { id: otherUserId },
    });

    await prismaClient.link.create({
      data: {
        user_id: otherUserId,
        alias: otherAlias,
        destination: 'https://private.com',
      },
    });

    const res = await app.request(`/link/${otherAlias}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'https://shouldfail.com',
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(403);
    expect(result?.message).toBe('Access forbidden');
  });

  it('should return 400 if request body invalid', async () => {
    const res = await app.request(`/link/${alias}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'invalid-url',
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result.message.destination).toBe('Destination must be valid url');
  });
});
