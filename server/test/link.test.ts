import { describe, it, expect, beforeAll, afterAll, test } from 'bun:test';
import { prismaClient } from '@app/config/database';
import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { app } from '../index';
import { APP_JWT_EXP, APP_JWT_SECRET } from '@app/config/setting';
import { hashId } from '@app/helpers/hashids';

describe('GET /link/all', () => {
  const username = 'user_test_getlinkbyuser';
  const password = 'pass_test_getlinkbyuser';
  let token: string;

  beforeAll(async () => {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashed,
        role: 'member',
        is_active: true,
      },
    });

    token = await sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        iat: Math.floor(Date.now() / 1000),
        exp: APP_JWT_EXP,
      },
      APP_JWT_SECRET,
      'HS256'
    );

    await prismaClient.auth.create({
      data: {
        user_id: user.id,
        token,
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        device_type: 'test-device',
      },
    });

    await prismaClient.link.createMany({
      data: [
        {
          user_id: user.id,
          alias: 'alias1',
          destination: 'https://example.com/1',
        },
        {
          user_id: user.id,
          alias: 'alias2',
          destination: 'https://example.com/2',
        },
      ],
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: {
        username,
      },
    });
  });

  it('should return user links with pagination', async () => {
    const res = await app.request(
      '/link/all?limit=1&offset=0&order_by=id&order=asc',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data?.data?.links?.length).toBeGreaterThan(0);
    expect(data?.data?.paging?.current_page).toBe(1);
    expect(data?.data?.paging?.total_links).toBeGreaterThan(0);
  });

  it('should fail with invalid query (limit = -1)', async () => {
    const res = await app.request('/link/all?limit=-1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data?.message?.limit).toBe(
      'Number must be greater than or equal to 1'
    );
  });

  it('should fail with invalid query (limit = not a number)', async () => {
    const res = await app.request('/link/all?limit=test', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data?.message?.limit).toBe('Limit must be a number');
  });

  it('should fail with invalid order_by value', async () => {
    const res = await app.request('/link/all?order_by=name', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data?.message?.order_by).toBe(
      'Order_by must be one of id, view, or created_at'
    );
  });
});

describe('GET /link/:alias', () => {
  const username = 'user_test_getlink';
  const password = 'pass_test_getlink';
  const alias = 'alias_getlink';
  const destination = 'https://example.com/getlink';

  beforeAll(async () => {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashed,
        role: 'member',
        is_active: true,
      },
    });

    await prismaClient.link.create({
      data: {
        user_id: user.id,
        alias,
        destination,
      },
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: {
        username,
      },
    });
  });

  it('should return the link data by alias', async () => {
    const res = await app.request(`/link/${alias}`, {
      method: 'GET',
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data?.data?.alias).toBe(alias);
    expect(data?.data?.destination).toBe(destination);
  });

  it('should return 400 if alias not found', async () => {
    const res = await app.request('/link/not-exist-shortlink', {
      method: 'GET',
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Shortlink not found');
  });
});

describe('POST /link', () => {
  const username = 'user_test_createlink';
  const password = 'pass_test_createlink';
  const destination = 'https://example.com/create-link';
  let token: string;

  beforeAll(async () => {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashed,
        role: 'member',
        is_active: true,
      },
    });

    token = await sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        iat: Math.floor(Date.now() / 1000),
        exp: APP_JWT_EXP,
      },
      APP_JWT_SECRET,
      'HS256'
    );

    await prismaClient.auth.create({
      data: {
        user_id: user.id,
        token,
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        device_type: 'test-device',
      },
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: {
        username,
      },
    });
  });

  it('should create a shortlink without alias', async () => {
    const res = await app.request('/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination }),
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data?.data?.destination).toBe(destination);
    expect(data?.data?.alias).toBeDefined();
  });

  it('should create a shortlink with custom alias', async () => {
    const alias = 'test_custom_alias_link';
    const res = await app.request('/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination, alias }),
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data?.data?.alias).toBe(alias);
  });

  it('should fail if alias is hashId-decoded number', async () => {
    const encoded = hashId.encode(1);
    const res = await app.request('/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination, alias: encoded }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Alias not allowed');
  });

  it('should fail if alias already exists', async () => {
    const aliasExist = 'test-existing-alias';
    await prismaClient.link.create({
      data: {
        alias: aliasExist,
        destination,
        user: {
          connect: {
            username,
          },
        },
      },
    });

    const res = await app.request('/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination, alias: aliasExist }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Alias is already exist');
  });

  it('should fail if destination is invalid', async () => {
    const res = await app.request('/link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination: 'invalid_url' }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data?.message?.destination).toContain(
      'Destination must be valid url'
    );
  });
});

describe('PUT /link/:alias', () => {
  const username = 'user_test_update_link';
  const password = 'pass_test_update_link';
  let token: string;
  let linkAlias: string;

  beforeAll(async () => {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashed,
        is_active: true,
        role: 'member',
      },
    });

    token = await sign(
      {
        id: user.id,
        username,
        role: user.role,
        is_active: user.is_active,
        iat: Math.floor(Date.now() / 1000),
        exp: APP_JWT_EXP,
      },
      APP_JWT_SECRET,
      'HS256'
    );

    await prismaClient.auth.create({
      data: {
        user_id: user.id,
        token,
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        device_type: 'test-device',
      },
    });

    const link = await prismaClient.link.create({
      data: {
        alias: 'testaliasupdate',
        destination: 'https://original.com',
        user_id: user.id,
      },
    });

    linkAlias = link.alias;
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: { username },
    });
  });

  it('should update link successfully', async () => {
    const res = await app.request(`/link/${linkAlias}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'https://updated.com',
      }),
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data?.data?.destination).toBe('https://updated.com');
  });

  it('should fail if alias not found', async () => {
    const res = await app.request('/link/test_not_exist', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination: 'https://fail.com' }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Shortlink not found');
  });

  it('should fail with invalid URL', async () => {
    const res = await app.request(`/link/${linkAlias}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination: 'invalid-url' }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message?.destination).toContain(
      'Destination must be valid url'
    );
  });

  it('should fail if alias already exist', async () => {
    // Create other link with alias 'conflictalias'
    await prismaClient.link.create({
      data: {
        alias: 'conflictalias',
        destination: 'https://conflict.com',
        user: {
          connect: { username },
        },
      },
    });

    const res = await app.request(`/link/${linkAlias}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alias: 'conflictalias' }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Alias is already exist');
  });

  it('should fail if alias is decoded from hashid', async () => {
    const encoded = hashId.encode(123); // valid hashid
    const res = await app.request(`/link/${linkAlias}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alias: encoded }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Alias not allowed');
  });
});

describe('DELETE /link/:alias', () => {
  const username = 'user_test_delete_link';
  const password = 'pass_test_delete_link';
  let token: string;
  let aliasToDelete: string;
  let userId: number;

  beforeAll(async () => {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashed,
        role: 'member',
        is_active: true,
      },
    });

    token = await sign(
      {
        id: user.id,
        username,
        role: user.role,
        is_active: user.is_active,
        iat: Math.floor(Date.now() / 1000),
        exp: APP_JWT_EXP,
      },
      APP_JWT_SECRET,
      'HS256'
    );

    await prismaClient.auth.create({
      data: {
        user_id: user.id,
        token,
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        device_type: 'test-device',
      },
    });

    const link = await prismaClient.link.create({
      data: {
        alias: 'testdeletethis',
        destination: 'https://delete.com',
        user_id: user.id,
      },
    });

    aliasToDelete = link.alias;
    userId = user.id;
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: {
        username: {
          in: [username, 'user_test_not_owner', 'user_admin_test_not_owner'],
        },
      },
    });
  });

  it('should delete link successfully', async () => {
    const res = await app.request(`/link/${aliasToDelete}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Deleted link successfully');
  });

  it('should return 400 if alias not found', async () => {
    const res = await app.request('/link/testnotexistalias', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Shortlink not found');
  });

  it('should return 403 if user is not owner or not admin', async () => {
    // Buat user lain dan link-nya
    const otherUser = await prismaClient.user.create({
      data: {
        username: 'user_test_not_owner',
        password: await bcrypt.hash('pass_test_delete_link2', 10),
        is_active: true,
        role: 'member',
      },
    });

    const link = await prismaClient.link.create({
      data: {
        alias: 'notownedalias',
        destination: 'https://forbidden.com',
        user_id: otherUser.id,
      },
    });

    const res = await app.request(`/link/${link.alias}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.message).toBe('Access forbidden');
  });

  it('should delete link successfully if role admin', async () => {
    // Buat user admin dan link-nya
    const adminUser = await prismaClient.user.create({
      data: {
        username: 'user_admin_test_not_owner',
        password: await bcrypt.hash('pass_test_delete_link3', 10),
        is_active: true,
        role: 'admin',
      },
    });

    const newToken = await sign(
      {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        is_active: adminUser.is_active,
        iat: Math.floor(Date.now() / 1000),
        exp: APP_JWT_EXP,
      },
      APP_JWT_SECRET,
      'HS256'
    );

    await prismaClient.auth.create({
      data: {
        user_id: adminUser.id,
        token: newToken,
      },
    });

    const link = await prismaClient.link.create({
      data: {
        alias: 'noadminlink',
        destination: 'https://admin.com',
        user_id: userId,
      },
    });

    const res = await app.request(`/link/${link.alias}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Deleted link successfully');
  });
});

describe('GET /link/:alias/count', () => {
  const username = 'user_test_count_link';
  const password = 'pass_test_count_link';
  let alias: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'member',
        is_active: true,
      },
    });

    const link = await prismaClient.link.create({
      data: {
        alias: 'countlinkalias',
        destination: 'https://count.com',
        view: 0,
        user_id: user.id,
      },
    });

    alias = link.alias;
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: { username },
    });
  });

  it('should increment view count', async () => {
    const res = await app.request(`/link/${alias}/count`, {
      method: 'GET',
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Add view succesfully');

    const updated = await prismaClient.link.findFirst({
      where: { alias },
    });

    expect(updated?.view).toBe(1);
  });

  it('should return 400 if alias not found', async () => {
    const res = await app.request('/link/testnotfoundalias/count', {
      method: 'GET',
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Shortlink not found');
  });
});
